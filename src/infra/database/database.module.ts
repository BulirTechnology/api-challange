import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

import { ClientsRepository } from "@/domain/users/application/repositories/client-repository";
import { UsersRepository } from "@/domain/users/application/repositories/user-repository";
import { DocumentRepository } from "@/domain/users/application/repositories/documents-repository";
import { OtpRepository } from "@/domain/users/application/repositories/otp-repository";

import { PrismaClientsRepository } from "./prisma/repositories/prisma-clients-repository";
import { PrismaOTPsRepository } from "./prisma/repositories/prisma-otps-repository";
import { PrismaUsersRepository } from "./prisma/repositories/prisma-users-repository";
import { PrismaDocumentsRepository } from "./prisma/repositories/prisma-documents-repository";
import { ServiceProvidersRepository } from "@/domain/users/application/repositories/service-provider-repository";
import { PrismaServiceProvidersRepository } from "./prisma/repositories/prisma-service-provider-repository";
import { PrismaCategoriesRepository } from "./prisma/repositories/prisma-categories-repository";
import { CategoriesRepository } from "@/domain/work/application/repositories/category-repository";
import { SubCategoriesRepository } from "@/domain/work/application/repositories/sub-category-repository";
import { PrismaSubCategoriesRepository } from "./prisma/repositories/prisma-sub-categories-repository";
import { SubSubCategoriesRepository } from "@/domain/work/application/repositories/sub-sub-category-repository";
import { PrismaSubSubCategoriesRepository } from "./prisma/repositories/prisma-sub-sub-categories-repository";
import { PrismaServicesRepository } from "./prisma/repositories/prisma-services-repository";
import { ServicesRepository } from "@/domain/work/application/repositories/service-repository";
import { PrismaPortfoliosRepository } from "./prisma/repositories/prisma-portfolio-repository";
import { PortfoliosRepository } from "@/domain/users/application/repositories/portfolio-repository";
import { SpecializationsRepository } from "@/domain/users/application/repositories/specialization-repository";
import { PrismaSpecializationsRepository } from "./prisma/repositories/prisma-specialization-repository";
import { AddressesRepository } from "@/domain/users/application/repositories/address-repository";
import { PrismaAddressesRepository } from "./prisma/repositories/prisma-addresses-repository";
import { PromotionsRepository } from "@/domain/work/application/repositories/promotion-repository";
import { PrismaPromotionsRepository } from "./prisma/repositories/prisma-promotions-repository";
import { UserPromotionsRepository } from "@/domain/users/application/repositories/user-promotion-repository";
import { PrismaUserPromotionsRepository } from "./prisma/repositories/prisma-user-promotions-repository";
import { PaymentMethodsRepository } from "@/domain/users/application/repositories/payment-method-repository";
import { PrismaPaymentMethodsRepository } from "./prisma/repositories/prisma-payment-method-repository";
import { NotificationsRepository } from "@/domain/users/application/repositories/notification-repository";
import { PrismaNotificationsRepository } from "./prisma/repositories/prisma-notification-repository";
import { PrismaQuestionsRepository } from "./prisma/repositories/prisma-questions-repository";
import { QuestionsRepository } from "@/domain/work/application/repositories/question-repository";
import { TasksRepository } from "@/domain/work/application/repositories/task-repository";
import { PrismaTasksRepository } from "./prisma/repositories/prisma-task-repository";
import { AnswersRepository } from "@/domain/work/application/repositories/answer-repository";
import { PrismaAnswersRepository } from "./prisma/repositories/prisma-answers-repository";
import { TaskDeleteReasonRepository } from "@/domain/work/application/repositories/task-delete-reason-repository";
import { PrismaTaskDeleteReasonRepository } from "./prisma/repositories/prisma-task-delete-reason";
import { JobCancelReasonRepository } from "@/domain/work/application/repositories/job-cancel-reason-repository";
import { PrismaJobCancelReasonRepository } from "./prisma/repositories/prisma-job-cancel-reason";
import { QuotationRejectReasonRepository } from "@/domain/work/application/repositories/quotation-reject-reason-repository";
import { PrismaQuotationRejectReasonRepository } from "./prisma/repositories/prisma-quotation-reject-reason";
import { QuotationsRepository } from "@/domain/work/application/repositories/quotations-repository";
import { PrismaQuotationsRepository } from "./prisma/repositories/prisma-quotations-repository";
import { JobsRepository } from "@/domain/work/application/repositories/job-repository";
import { PrismaJobsRepository } from "./prisma/repositories/prisma-jobs-repository";
import { PrivateTasksRepository } from "@/domain/work/application/repositories/private-task-repository";
import { PrismaPrivateTasksRepository } from "./prisma/repositories/prisma-private-tasks-repository";
import { WalletRepository } from "@/domain/payment/application/repositories/wallet-repository";
import { PrismaWalletRepository } from "./prisma/repositories/prisma-wallet-repository";
import { TransactionRepository } from "@/domain/payment/application/repositories/transaction-repository";
import { PrismaTransactionRepository } from "./prisma/repositories/prisma-transaction-repository";
import { FileDisputeReasonRepository } from "@/domain/work/application/repositories/file-dispute-reason-repository";
import { PrismaFileDisputeReasonRepository } from "./prisma/repositories/prisma-file-dispute-reason-repository";
import { FileDisputeRepository } from "@/domain/work/application/repositories/file-dispute-repository";
import { PrismaFileDisputeRepository } from "./prisma/repositories/prisma-file-dispute-repository";
import { BookingsRepository } from "@/domain/work/application/repositories/booking-repository";
import { PrismaBookingsRepository } from "./prisma/repositories/prisma-booking-respository";
import { ReviewAndRatingRepository } from "@/domain/work/application/repositories/review-and-rating-repository";
import { PrismaReviewAndRatingRepository } from "./prisma/repositories/prisma-review-and-rating-repository";
import { EmailPhoneUpdateRepository } from "@/domain/users/application/repositories/email-phone-update-repository";
import { PrismaEmailPhoneUpdateRepository } from "./prisma/repositories/prisma-email-phone-update-repository";
import { AnswersJobRepository } from "@/domain/work/application/repositories/answer-job-repository";
import { PrismaAnswersJobRepository } from "./prisma/repositories/prisma-answers-job-repository";
import { FcmTokenRepository } from "@/domain/users/application/repositories/fcm-token-repository";
import { PrismaFcmTokenRepository } from "./prisma/repositories/prisma-fcm-token-repository";
import { ClientServiceProviderFavoriteRepository } from "@/domain/users/application/repositories/client-service-provider-favorite";
import { PrismaClientServiceProviderFavoritesRepository } from "./prisma/repositories/prisma-client-service-provider-favorites-repository";
import { ConversationsRepository } from "@/domain/work/application/repositories/conversation-repository";
import { PrismaConversationsRepository } from "./prisma/repositories/prisma-conversation-repository";
import { MessagesRepository } from "@/domain/work/application/repositories/message-repository";
import { PrismaMessagesRepository } from "./prisma/repositories/prisma-message-repository";
import { SubscriptionPlanRepository } from "@/domain/subscriptions/applications/repositories/subscription-plan-repository";
import { PrismaSubscriptionPlanRepository } from "./prisma/repositories/prisma-subscription-plan-repository";
import { DiscountCommissionRepository } from "@/domain/subscriptions/applications/repositories/discount-commission-repository";
import { PrismaDiscountCommissionRepository } from "./prisma/repositories/prisma-discount-commission-repository";
import { SubscriptionsRepository } from "@/domain/subscriptions/applications/repositories/subscription-repository";
import { PrismaSubscriptionRepository } from "./prisma/repositories/prisma-subscription-repository";
import { PrismaClientInquiresRepository } from "./prisma/repositories/prisma-client-inquire-repository";
import { ClientInquiresRepository } from "@/domain/inquire/application/repositories/client-inquire-repository";
import { PrismaServiceProviderInquiresRepository } from "./prisma/repositories/prisma-service-provider-inquire-repository";
import { ServiceProviderInquiresRepository } from "@/domain/inquire/application/repositories/service-provider-inquire-repository";
import { PrismaActivityRepository } from "./prisma/repositories/prisma-activity-repository";
import { ActivityRepository } from "@/domain/users/application/repositories/activity-repository";
import { PushNotificationRepository } from "@/domain/users/application/repositories/push-notification-repository";
import { PrismaPushNotificationsRepository } from "./prisma/repositories/prisma-push-notification-repository";
import { CreditPackageRepository } from "@/domain/subscriptions/applications/repositories/credit-package-repository";
import { PrismaCreditPackageRepository } from "./prisma/repositories/prisma-credit-package-repository";
import { PrismaHelpersRatingAndFavoriteRepository } from "./prisma/prisma-common-helpers.service";

@Module({
  providers: [
    PrismaService,
    PrismaHelpersRatingAndFavoriteRepository,
    {
      provide: ClientsRepository,
      useClass: PrismaClientsRepository,
    },
    {
      provide: OtpRepository,
      useClass: PrismaOTPsRepository,
    },
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: DocumentRepository,
      useClass: PrismaDocumentsRepository,
    },
    {
      provide: ServiceProvidersRepository,
      useClass: PrismaServiceProvidersRepository,
    },
    {
      provide: CategoriesRepository,
      useClass: PrismaCategoriesRepository,
    },
    {
      provide: SubCategoriesRepository,
      useClass: PrismaSubCategoriesRepository,
    },
    {
      provide: SubSubCategoriesRepository,
      useClass: PrismaSubSubCategoriesRepository,
    },
    {
      provide: ServicesRepository,
      useClass: PrismaServicesRepository,
    },
    {
      provide: PortfoliosRepository,
      useClass: PrismaPortfoliosRepository,
    },
    {
      provide: SpecializationsRepository,
      useClass: PrismaSpecializationsRepository,
    },
    {
      provide: AddressesRepository,
      useClass: PrismaAddressesRepository,
    },
    {
      provide: PromotionsRepository,
      useClass: PrismaPromotionsRepository,
    },
    {
      provide: UserPromotionsRepository,
      useClass: PrismaUserPromotionsRepository,
    },
    {
      provide: PaymentMethodsRepository,
      useClass: PrismaPaymentMethodsRepository,
    },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
    {
      provide: QuestionsRepository,
      useClass: PrismaQuestionsRepository,
    },
    {
      provide: TasksRepository,
      useClass: PrismaTasksRepository,
    },
    {
      provide: AnswersRepository,
      useClass: PrismaAnswersRepository,
    },
    {
      provide: TaskDeleteReasonRepository,
      useClass: PrismaTaskDeleteReasonRepository,
    },
    {
      provide: JobCancelReasonRepository,
      useClass: PrismaJobCancelReasonRepository,
    },
    {
      provide: QuotationRejectReasonRepository,
      useClass: PrismaQuotationRejectReasonRepository,
    },
    {
      provide: QuotationsRepository,
      useClass: PrismaQuotationsRepository,
    },
    {
      provide: JobsRepository,
      useClass: PrismaJobsRepository,
    },
    {
      provide: PrivateTasksRepository,
      useClass: PrismaPrivateTasksRepository,
    },
    {
      provide: WalletRepository,
      useClass: PrismaWalletRepository,
    },
    {
      provide: WalletRepository,
      useClass: PrismaWalletRepository,
    },
    {
      provide: TransactionRepository,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: FileDisputeReasonRepository,
      useClass: PrismaFileDisputeReasonRepository,
    },
    {
      provide: FileDisputeRepository,
      useClass: PrismaFileDisputeRepository,
    },
    {
      provide: BookingsRepository,
      useClass: PrismaBookingsRepository,
    },
    {
      provide: ReviewAndRatingRepository,
      useClass: PrismaReviewAndRatingRepository,
    },
    {
      provide: EmailPhoneUpdateRepository,
      useClass: PrismaEmailPhoneUpdateRepository,
    },
    {
      provide: AnswersJobRepository,
      useClass: PrismaAnswersJobRepository,
    },
    {
      provide: FcmTokenRepository,
      useClass: PrismaFcmTokenRepository,
    },
    {
      provide: ClientServiceProviderFavoriteRepository,
      useClass: PrismaClientServiceProviderFavoritesRepository,
    },
    {
      provide: ConversationsRepository,
      useClass: PrismaConversationsRepository,
    },
    {
      provide: MessagesRepository,
      useClass: PrismaMessagesRepository,
    },
    {
      provide: SubscriptionPlanRepository,
      useClass: PrismaSubscriptionPlanRepository,
    },
    {
      provide: DiscountCommissionRepository,
      useClass: PrismaDiscountCommissionRepository,
    },
    {
      provide: SubscriptionsRepository,
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: ClientInquiresRepository,
      useClass: PrismaClientInquiresRepository,
    },
    {
      provide: ServiceProviderInquiresRepository,
      useClass: PrismaServiceProviderInquiresRepository,
    },
    {
      provide: ActivityRepository,
      useClass: PrismaActivityRepository,
    },
    {
      provide: PushNotificationRepository,
      useClass: PrismaPushNotificationsRepository,
    },
    {
      provide: PushNotificationRepository,
      useClass: PrismaPushNotificationsRepository,
    },
    {
      provide: CreditPackageRepository,
      useClass: PrismaCreditPackageRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
    ClientsRepository,
    OtpRepository,
    DocumentRepository,
    ServiceProvidersRepository,
    CategoriesRepository,
    SubCategoriesRepository,
    SubSubCategoriesRepository,
    ServicesRepository,
    PortfoliosRepository,
    SpecializationsRepository,
    AddressesRepository,
    PromotionsRepository,
    UserPromotionsRepository,
    PaymentMethodsRepository,
    NotificationsRepository,
    QuestionsRepository,
    TasksRepository,
    AnswersRepository,
    TaskDeleteReasonRepository,
    QuotationsRepository,
    JobsRepository,
    PrivateTasksRepository,
    JobCancelReasonRepository,
    QuotationRejectReasonRepository,
    WalletRepository,
    TransactionRepository,
    FileDisputeReasonRepository,
    FileDisputeRepository,
    BookingsRepository,
    ReviewAndRatingRepository,
    EmailPhoneUpdateRepository,
    AnswersJobRepository,
    FcmTokenRepository,
    ClientServiceProviderFavoriteRepository,
    ConversationsRepository,
    MessagesRepository,
    SubscriptionPlanRepository,
    DiscountCommissionRepository,
    SubscriptionsRepository,
    ClientInquiresRepository,
    ServiceProviderInquiresRepository,
    ActivityRepository,
    PushNotificationRepository,
    CreditPackageRepository,
  ],
})
export class DatabaseModule {}
