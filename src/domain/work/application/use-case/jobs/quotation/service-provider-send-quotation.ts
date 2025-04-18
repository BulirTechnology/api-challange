import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ServiceProvidersRepository,
  NotificationsRepository,
  ClientsRepository,
  PushNotificationRepository,
} from "@/domain/users/application/repositories";

import {
  TransactionRepository,
  WalletRepository,

} from "@/domain/payment/application/repositories";

import {
  Wallet
} from "@/domain/payment/enterprise";
import {
  InsufficientCreditBalanceError,
  HavePendingQuotationError
} from "@/domain/payment/application/use-case/errors";

import {
  LanguageSlug,
} from "@/domain/users/enterprise";

import { Quotation } from "../../../../enterprise";
import {
  QuotationsRepository,
  JobsRepository
} from "../../../repositories";

import { SocketGateway } from "@/infra/websocket/socket.gateway";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createTransactionRegister } from "@/domain/payment/application/use-case/helper/create-transaction-register";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface ServiceProviderSendQuotationUseCaseRequest {
  language: LanguageSlug
  jobId: string
  budget: number
  cover: string
  date: Date
  userId: string
}

type ServiceProviderSendQuotationUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class ServiceProviderSendQuotationUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private jobsRepository: JobsRepository,
    private quotationRepository: QuotationsRepository,
    private transactionRepository: TransactionRepository,
    private walletRepository: WalletRepository,
    private notificationRepository: NotificationsRepository,
    private clientRepository: ClientsRepository,
    private readonly i18n: I18nService,
    private pushNotificationRepository: PushNotificationRepository,
    private readonly socketGateway: SocketGateway
  ) { }

  async execute({
    budget,
    cover,
    date,
    jobId,
    userId
  }: ServiceProviderSendQuotationUseCaseRequest): Promise<ServiceProviderSendQuotationUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const job = await this.jobsRepository.findById({
      accountType: "ServiceProvider",
      id: jobId,
      userId
    });

    if (!job) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")));
    }

    const hasPendingQuotation = await this.quotationRepository.spHasPendingQuotation({
      jobId: job.id.toString(),
      serviceProviderId: serviceProvider.id.toString(),
    });

    if (hasPendingQuotation) {
      return left(new HavePendingQuotationError());
    }

    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      return left(new InsufficientCreditBalanceError());
    }

    if (wallet.creditBalance < 2) {
      return left(new InsufficientCreditBalanceError());
    }

    const updateWallet = Wallet.create({
      balance: wallet.balance,
      creditBalance: wallet.creditBalance - 2,
      userId: wallet.userId,
    }, wallet.id);
    await this.walletRepository.update(updateWallet);

    await createTransactionRegister({
      amount: 0,
      descriptionPt: `2 ${processI18nMessage(this.i18n, "errors.transaction.send_quotation", "pt")}`,
      descriptionEn: `2 ${processI18nMessage(this.i18n, "errors.transaction.send_quotation", "en")}`,
      jobId: job.id,
      status: "Completed",
      type: "DiscountCredit",
      walletId: wallet.id,
      promotionId: null,
      transactionRepository: this.transactionRepository
    })

    if (job.quotationState !== "QUOTED")
      await this.jobsRepository.updateQuotationState(job.id.toString(), "QUOTED");

    const quotation = Quotation.create({
      budget,
      cover,
      state: "PENDING",
      date,
      jobId: job.id,
      readByClient: false,
      serviceProviderId: serviceProvider.id,
    });
    const quotationCreated = await this.quotationRepository.create(quotation);

    const client = await this.clientRepository.findById(job.clientId.toString());
    const clientUser = await this.userRepository.findById(client?.userId.toString() + "");

    const totalPendingQuotations = await this.jobsRepository.countUnreadedQuotations({
      clientId: client?.id.toString() + '',
    });

    await createNotificationRegister({
      descriptionPt: `Um freelancer está interessado no seu trabalho: ${job.title}. Veja os detalhes da proposta agora mesmo.`,
      descriptionEn: `A freelancer is interested in your job: ${job.title}. Check out the proposal details right now.`,
      parentId: quotationCreated.id.toString(),
      titlePt: "Você Tem Uma Nova Proposta!",
      titleEn: "You Have a New Proposal!",
      type: "JobQuoted",
      userId: new UniqueEntityID(client?.userId + ""),
      language: I18nContext.current()?.lang as LanguageSlug ?? "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: "JOBDETAILS",
      pushNotificationRepository: this.pushNotificationRepository
    })

    this.socketGateway.notifyClientSpSendNewQuotation({
      jobId,
      quotation: quotationCreated,
      totalPendingQuotations,
      socketId: `${clientUser?.socketId}`
    });

    return right(null);
  }
}
