import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  SpecializationsRepository,
  PortfoliosRepository,
  PushNotificationRepository,
  UsersRepository,
  ServiceProvidersRepository,
  NotificationsRepository
} from "../../../repositories";
import { WalletRepository } from "@/domain/payment/application/repositories";
import {
  SubscriptionsRepository,
  SubscriptionPlanRepository
} from "@/domain/subscriptions/applications/repositories";

import { Subscription } from "@/domain/subscriptions/enterprise";
import {
  LanguageSlug,
} from "@/domain/users/enterprise";

import { DateProvider } from "../../../date/date-provider";

import { InvalidActiveServiceProviderState } from "../errors/invalid-active-service-provider";

import { checkNextStep } from "../../user/authentication/helper/setup-next-step";
import { createWallet } from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface ActiveServiceProviderUseCaseRequest {
  language: LanguageSlug
  userId: string
}

type ActiveServiceProviderUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class ActiveServiceProviderUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private walletRepository: WalletRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository,
    private subscriptionsRepository: SubscriptionsRepository,
    private dateProvider: DateProvider,
    private readonly i18n: I18nService,
    private notificationRepository: NotificationsRepository,
    private portfoliosRepository: PortfoliosRepository,
    private specializationsRepository: SpecializationsRepository,
    private pushNotificationRepository: PushNotificationRepository
  ) { }

  async execute({
    userId,
  }: ActiveServiceProviderUseCaseRequest): Promise<ActiveServiceProviderUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User register not found"));
    }

    const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider register not found"));
    }

    if (user.state !== "SetupAccount") {
      return left(new InvalidActiveServiceProviderState("PersonalInfo"));
    }

    let nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined = undefined;
    if (user.state === "SetupAccount") {
      nextStep = await checkNextStep(
        user,
        serviceProvider,
        this.specializationsRepository,
        this.portfoliosRepository
      );
    }

    if (nextStep) {
      return left(new InvalidActiveServiceProviderState(nextStep));
    }

    await this.userRepository.updateState(user?.id.toString(), "Active");
    const wallet = await this.walletRepository.findByUserId(user.id.toString());

    if (!wallet)
      await createWallet(userId, this.walletRepository)

    const defaultSubscriptionPlan = await this.subscriptionPlanRepository.findDefaultPlan();

    if (defaultSubscriptionPlan) {
      const startDate = new Date();
      const endDate = this.dateProvider.addDays(defaultSubscriptionPlan.duration);

      const subscription = Subscription.create({
        endDate,
        startDate,
        serviceProviderId: serviceProvider.id,
        status: "ACTIVE",
        subscriptionPlanId: defaultSubscriptionPlan.id,
        updatedAt: new Date()
      });

      await this.subscriptionsRepository.create(subscription);
    }

    await createNotificationRegister({
      descriptionPt: `${serviceProvider.firstName} ${serviceProvider.lastName} ${this.i18n.t("errors.notification.register_success_description", { lang: "pt" })}`,
      descriptionEn: `${serviceProvider.firstName} ${serviceProvider.lastName} ${this.i18n.t("errors.notification.register_success_description", { lang: "en" })}`,
      titlePt: this.i18n.t("errors.notification.register_success_title", { lang: "pt" }),
      titleEn: this.i18n.t("errors.notification.register_success_title", { lang: "en" }),
      userId: user.id,
      parentId: null,
      type: "RegisterSuccess",
      language: "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: "EMPTY",
      pushNotificationRepository: this.pushNotificationRepository
    })

    return right(null);
  }
}
