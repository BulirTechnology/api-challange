import {
  I18nContext,
  I18nService
} from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ClientsRepository,
  UserPromotionsRepository,
  NotificationsRepository,
  ServiceProvidersRepository,
  PushNotificationRepository
} from "@/domain/users/application/repositories";

import {
  WalletRepository,
  TransactionRepository
} from "@/domain/payment/application/repositories";
import {
  Wallet,
} from "@/domain/payment/enterprise";
import {
  InsufficientBalanceError
} from "@/domain/payment/application/use-case/errors";
import {
  PromotionNotFoundError
} from "@/domain/users/application/use-cases/errors";

import {
  LanguageSlug,
} from "@/domain/users/enterprise";

import {
  Booking,
  Conversation,
  Quotation
} from "@/domain/work/enterprise";

import {
  JobsRepository,
  QuotationsRepository,
  BookingsRepository,
  ConversationsRepository
} from "../../../repositories";

import { SocketGateway } from "@/infra/websocket/socket.gateway";
import {
  DiscountCommissionRepository,
  SubscriptionPlanRepository,
  SubscriptionsRepository
} from "@/domain/subscriptions/applications/repositories";
import { createWallet } from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createTransactionRegister } from "@/domain/payment/application/use-case/helper/create-transaction-register";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface AcceptQuotationUseCaseRequest {
  language: LanguageSlug
  userId: string,
  jobId: string
  quotationId: string
  promotionId: string | undefined
}

type AcceptQuotationUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class AcceptQuotationUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private jobsRepository: JobsRepository,
    private quotationsRepository: QuotationsRepository,
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private userPromotionRepository: UserPromotionsRepository,
    private notificationRepository: NotificationsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private bookingRepository: BookingsRepository,
    private conversationRepository: ConversationsRepository,
    private readonly i18n: I18nService,
    private pushNotificationRepository: PushNotificationRepository,
    private readonly socketGateway: SocketGateway,
    private subscriptionsRepository: SubscriptionsRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository,
    private discountCommissionRepository: DiscountCommissionRepository
  ) { }

  async execute({
    userId,
    jobId,
    quotationId,
    promotionId
  }: AcceptQuotationUseCaseRequest): Promise<AcceptQuotationUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const job = await this.jobsRepository.findById({
      id: jobId,
      accountType: "Client",
      userId
    });

    if (!job) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")
      ));
    }

    if (job.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")
      ));
    }

    const quotation = await this.quotationsRepository.findById(quotationId);

    if (quotation?.jobId.toString() !== job.id.toString()) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.quotation.not_found")
      ));
    }

    let currentWallet = await this.walletRepository.findByUserId(userId);

    if (!currentWallet) currentWallet = await createWallet(userId, this.walletRepository)

    if (currentWallet.balance <= 0 && !promotionId) {
      return left(new InsufficientBalanceError());
    }

    if (promotionId) {
      await this.handleAddPromotionCode({
        currentWallet,
        promotionId,
        quotation,
        userId
      })
    } else {
      const walletToUpdate = Wallet.create({
        balance: currentWallet.balance - quotation.budget,
        creditBalance: currentWallet.creditBalance,
        userId: currentWallet.userId,
      }, currentWallet.id);
      await this.walletRepository.update(walletToUpdate);
    }

    await createTransactionRegister({
      amount: quotation.budget,
      descriptionEn: processI18nMessage(this.i18n, "errors.job.job_payment", "en"),
      descriptionPt: processI18nMessage(this.i18n, "errors.job.job_payment", "pt"),
      jobId: job.id,
      promotionId: new UniqueEntityID(promotionId),
      status: "Pending",
      type: "ServicePayment",
      walletId: currentWallet.id,
      transactionRepository: this.transactionRepository,
    })

    await this.quotationsRepository.updateState(quotationId, "ACCEPTED");
    await this.jobsRepository.updateState(job.id.toString(), "BOOKED");

    const booking = Booking.create({
      clientId: job.clientId,
      description: job.description,
      finalPrice: quotation.budget,
      image1: job.image1,
      image2: job.image2,
      image3: job.image3,
      image4: job.image4,
      image5: job.image5,
      image6: job.image6,
      jobId: job.id,
      requestWorkState: "UPCOMING",
      serviceId: job.serviceId,
      serviceProviderId: new UniqueEntityID(quotation.serviceProviderId + ''),
      state: "PENDING",
      title: job.title,
      workDate: quotation.date,
      workState: "UPCOMING",
      totalTryingToFinish: 0,
      totalTryingToStart: 0,
      clientSendReview: false,
      serviceProviderSendReview: false,
      hasStartedDispute: false,
      conversationId: "",
      clientReview: 0,
      serviceProviderReview: 0
    });
    const bookingCreatedId = await this.bookingRepository.create(booking);

    const conversation = Conversation.create({
      bookingId: new UniqueEntityID(bookingCreatedId),
      messages: [],
    });
    await this.conversationRepository.create(conversation);

    await this.processServiceProviderPayment({
      jobId: job.id,
      promotionId: promotionId ? new UniqueEntityID(promotionId) : null,
      quotation,
      bookingCreatedId: bookingCreatedId
    })

    return right(null);
  }

  private async handleAddPromotionCode(
    {
      promotionId,
      userId,
      quotation,
      currentWallet
    }: {
      userId: string
      promotionId: string
      quotation: Quotation
      currentWallet: Wallet
    }
  ) {
    const userPromotion = await this.userPromotionRepository.findById(promotionId);

    if (!userPromotion) {
      return left(new PromotionNotFoundError(processI18nMessage(this.i18n, "errors.promotion.not_found")
      ));
    }
    if (userPromotion.state === "USED" || userPromotion.userId.toString() !== userId) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.promotion.not_found")
      ));
    }

    let discount = 0;
    if (userPromotion.promotionType === "Percentage") {
      discount = quotation.budget * (userPromotion.discount / 100);
    } else {
      discount = userPromotion.discount;
    }

    const finalPrice = quotation.budget - discount;

    if (finalPrice > 0 && currentWallet.balance - finalPrice < 0) {
      return left(new InsufficientBalanceError());
    }

    if (quotation.budget > userPromotion.discount) {
      const walletToUpdate = Wallet.create({
        balance: currentWallet.balance - finalPrice,
        creditBalance: currentWallet.creditBalance,
        userId: currentWallet.userId,
      }, currentWallet.id);
      await this.walletRepository.update(walletToUpdate);
    }

    await this.userPromotionRepository.updateState(userPromotion.id.toString(), "USED");
  }

  private async processServiceProviderPayment({
    quotation,
    jobId,
    promotionId,
    bookingCreatedId
  }: {
    quotation: Quotation
    jobId: UniqueEntityID
    promotionId: UniqueEntityID | null
    bookingCreatedId: string
  }) {

    const serviceProvider = await this.serviceProviderRepository.findById(quotation.serviceProviderId?.toString() + '');
    const userSp = await this.userRepository.findById(serviceProvider?.userId.toString() + "");

    const spWallet = await this.walletRepository.findByUserId(serviceProvider?.userId.toString() + '')

    const spActiveSubscription = await this.subscriptionsRepository.findActiveSubscription({
      serviceProviderId: serviceProvider?.id.toString() + '',
    })

    const subscriptionPlan = await this.subscriptionPlanRepository.findById(spActiveSubscription?.subscriptionPlanId.toString() + '')

    let discount = 0;
    if (subscriptionPlan?.discountType === "FIXED") {
      discount = quotation.budget - subscriptionPlan.discountValue
    } else {
      const discountsValues = await this.discountCommissionRepository.findMany({
        subscriptionPlanId: spActiveSubscription?.subscriptionPlanId.toString() + '',
        page: 1,
        perPage: 40
      })

      for (let discountItem of discountsValues) {
        if (quotation.budget >= discountItem.minValue && quotation.budget <= discountItem.maxValue) {
          discount = quotation.budget - discountItem.commission
        }
      }
    }

    await createTransactionRegister({
      amount: quotation.budget - discount,
      descriptionPt: this.i18n.t("errors.job.job_payment", { lang: "pt" }),
      descriptionEn: this.i18n.t("errors.job.job_payment", { lang: "en" }),
      jobId: jobId,
      status: "Pending",
      type: "ServiceSalary",
      walletId: new UniqueEntityID(`${spWallet?.id.toString()}`),
      promotionId: promotionId,
      transactionRepository: this.transactionRepository
    })

    await createNotificationRegister({
      descriptionPt: "A tua proposta para o trabalho foi aceite. Desfrute do serviço 🎉",
      descriptionEn: "Your proposal was accepted. Enjoy the service 🎉",
      parentId: bookingCreatedId.toString(),
      titlePt: "Proposta Aceite",
      titleEn: "Accepted Proposal",
      type: "JobAccepted",
      userId: new UniqueEntityID(serviceProvider?.userId + ""),
      language: I18nContext.current()?.lang as LanguageSlug ?? "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRepository: this.pushNotificationRepository,
      pushNotificationRedirectTo: 'JOBDETAILS'
    })

    this.socketGateway.notifySpClientAcceptedQuotation({
      quotationId: quotation.id.toString(),
      socketId: `${userSp?.socketId}`
    });
  }
}