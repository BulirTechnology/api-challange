import { DatabaseModule } from "@/infra/database/database.module";
import { Module } from "@nestjs/common";

import { RegisterClientController } from "./controllers/create-account/register-client.controller";
import { RegisterClientUseCase } from "@/domain/users/application/use-cases/client/register-client";
import { CryptographyModule } from "../cryptography/cryptography.module";
import { MailModule } from "../mail/mail.module";
import { SMSModule } from "../sms/sms.module";
import { DateModule } from "../date/date.module";
import { ValidateEmailController } from "./controllers/create-account/validation/validate-email.controller";
import { OtpValidationUseCase } from "@/domain/users/application/use-cases/user/otp-validation";
import { ResendPhoneOtpController } from "./controllers/create-account/validation/resend-phone-otp.controller";
import { ResendEmailOtpController } from "./controllers/create-account/validation/resend-email-otp.controller";
import { ValidatePhoneController } from "./controllers/create-account/validation/validate-phone.controller";
import { SendForgotPasswordMailController } from "./controllers/user/public/send-forgot-password.controller";
import { AuthenticatedController } from "./controllers/session/authenticate.controller";
import { AuthenticateUserUseCase } from "@/domain/users/application/use-cases/user/authentication/authenticate-user";
import { UploadNifBIController } from "./controllers/create-account/create-account-sp/upload-nif-bi-attachment.controller";
import { UploadDocumentUseCase } from "@/domain/users/application/use-cases/service-provider/register/upload-documents-attachment";
import { StorageModule } from "../storage/storage.module";
import { RegisterServiceProviderController } from "./controllers/create-account/create-account-sp/register-service-provider.controller";
import { RegisterServiceProviderUseCase } from "@/domain/users/application/use-cases/service-provider/register/register-service-provider";
import { UpdatePasswordController } from "./controllers/user/authenticated/profile/update-password.controller";
import { SetupPasswordController } from "./controllers/create-account/create-account-sp/setup-password-to-service-provider.controller";
import { SetupServiceProviderPasswordUseCase } from "@/domain/users/application/use-cases/service-provider/register/setup-service-provider-password";
import { CreateCategoryController } from "./controllers/admin/categories/categories/create-categories.controller";
import { CreateCategoryUseCase } from "@/domain/work/application/use-case/categories/category/create-category";
import { FetchRecentCategoryController } from "./controllers/admin/categories/categories/fetch-categories.controller";
import { FetchCategoriesUseCase } from "@/domain/work/application/use-case/categories/category/fetch-categories";
import { UpdateCategoryImageController } from "./controllers/admin/categories/categories/update-category-image.controller";
import { UpdateCategoryImageUseCase } from "@/domain/work/application/use-case/categories/category/update-category-image";
import { CreateSubCategoryController } from "./controllers/admin/categories/subcategories/create-subcategory.controller";
import { CreateSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-category/create-subcategory";
import { CreateSubSubCategoryController } from "./controllers/admin/categories/subsubcategories/create-sub-subcategory.controller";
import { CreateSubSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/create-sub-subcategory";
import { UpdateSubCategoryImageController } from "./controllers/admin/categories/subcategories/update-subcategory-image.controller";
import { UpdateSubCategoryImageUseCase } from "@/domain/work/application/use-case/categories/sub-category/update-subcategory-image";
import { UpdateSubSubCategoryImageController } from "./controllers/admin/categories/subsubcategories/update-sub-subcategory-image.controller";
import { UpdateSubSubCategoryImageUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/update-sub-subcategory-image";
import { CreateServiceController } from "./controllers/admin/categories/services/create-service.controller";
import { CreateServiceUseCase } from "@/domain/work/application/use-case/categories/services/create-service";
import { FetchRecentServiceController } from "./controllers/admin/categories/services/fetch-services.controller";
import { FetchRecentSubSubCategoryController } from "./controllers/admin/categories/subsubcategories/fetch-sub-subcategories.controller";
import { FetchRecentSubCategoryController } from "./controllers/admin/categories/subcategories/fetch-subcategories.controller";
import { FetchServicesUseCase } from "@/domain/work/application/use-case/categories/services/fetch-services";
import { FetchSubSubCategoriesUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/fetch-sub-sub-categories";
import { FetchSubCategoriesUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/fetch-sub-categories";
import { AddServiceProviderPortfolioController } from "./controllers/service-provider/account/add-service-provider-portfolio.controller";
import { AddServiceProviderPortfolioUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/add-service-provider-portfolio";
import { AddServiceProviderSpecializationController } from "./controllers/service-provider/account/add-service-provider-specialization.controller";
import { AddServiceProviderSpecializationUseCase } from "@/domain/users/application/use-cases/service-provider/specialization/add-service-provider-specialization";
import { UpdateServiceProviderSpecializationController } from "./controllers/service-provider/account/update-service-provider-specification.controller";
import { UpdateServiceProviderSpecializationUseCase } from "@/domain/users/application/use-cases/service-provider/specialization/update-service-provider-specialization";
import { UpdateServiceProviderPortfolioController } from "./controllers/service-provider/account/update-service-provider-portfolio.controller";
import { UpdateServiceProviderPortfolioUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/update-service-provider-portfolio";
import { DeleteServiceProviderSpecializationUseCase } from "@/domain/users/application/use-cases/service-provider/specialization/delete-service-provider-specialization";
import { DeleteServiceProviderPortfolioController } from "./controllers/service-provider/account/delete-service-provider-portfolio.controller";
import { DeleteServiceProviderSpecializationController } from "./controllers/service-provider/account/delete-service-provider-specialization.controller";
import { DeleteServiceProviderPortfolioUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/delete-service-provider-portfolio";
import { FetchServiceProviderPortfolioController } from "./controllers/service-provider/account/fetch-service-provider-portfolio.controller";
import { FetchServiceProviderPortfoliosUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/fetch-service-provider-portfolios";
import { FetchServiceProviderSpecializationController } from "./controllers/service-provider/account/fetch-service-provider-specification.controller";
import { FetchServiceProviderSpecializationsUseCase } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-service-provider-specializations";
import { RequestUpdateEmailController } from "./controllers/user/public/request-update-email.controller";
import { RequestUpdatePhoneNumberController } from "./controllers/user/public/request-update-phone-number.controller";
import { UpdateEmailController } from "./controllers/user/public/update-email.controller";
import { UpdatePhoneNumberController } from "./controllers/user/public/update-phone-number.controller";
import { UpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/public/update-phone-number";
import { UpdateAddressController } from "./controllers/user/public/update-address.controller";
import { CreatePromotionController } from "./controllers/admin/promotions/create-promotion.controller";
import { CreatePromotionUseCase } from "@/domain/work/application/use-case/promotion/create-promotion";
import { FetchRecentPromotionController } from "./controllers/admin/promotions/fetch-promotions.controller";
import { FetchPromotionsUseCase } from "@/domain/work/application/use-case/promotion/fetch-promotions";
import { AddPromotionToUserController } from "./controllers/shared-client-service-provider/promotions/add-promotion-to-user.controller";
import { AddPromotionToUserUseCase } from "@/domain/users/application/use-cases/promotion/add-promotion-to-user";
import { FetchRecentUserPromotionController } from "./controllers/shared-client-service-provider/promotions/fetch-user-promotions.controller";
import { UpdateUserDefaultLanguageController } from "./controllers/user/authenticated/profile/update-user-default-language.controller";
import { EtherealMailSender } from "../mail/ethereal-mail-sender";
import { SendGridService } from "../mail/sendgrid-mail";
import { EnvService } from "../environment/env.service";
import { SendRequestToRecoverPasswordController } from "./controllers/user/public/send-request-to-recover-password.controller";
import { RecoverPasswordUpdateController } from "./controllers/user/public/recover-password-update.controller";
import { RecoverPasswordUpdateUseCase } from "@/domain/users/application/use-cases/user/recover-password-update";
import { ValidateOTPController } from "./controllers/create-account/validation/validate-otp.controller";
import { UpdateUserProfileController } from "./controllers/user/authenticated/profile/update-user-profile.controller";
import { UpdateUserProfileCase } from "@/domain/users/application/use-cases/user/update-user-profile";
import { FetchUserAddressController } from "./controllers/shared-client-service-provider/address/fetch-user-address.controller";
import { FetchUserAddressesUseCase } from "@/domain/users/application/use-cases/user/address/fetch-user-addresses";
import { SetUserAddressPrimaryController } from "./controllers/shared-client-service-provider/address/set-user-address-primary.controller";
import { UpdateUserAddressController } from "./controllers/shared-client-service-provider/address/update-user-address.controller";
import { AddAddressToUserController } from "./controllers/shared-client-service-provider/address/add-address-to-user.controller";
import { AddAddressToUserUseCase } from "@/domain/users/application/use-cases/user/address/add-address-to-user";
import { DeleteUserAddressController } from "./controllers/shared-client-service-provider/address/disable-user-address.controller";
import { DeleteUserAddressUseCase } from "@/domain/users/application/use-cases/user/address/delete-user-address";
import { AddPaymentMethodToUserController } from "./controllers/shared-client-service-provider/payment-method/add-payment-method-to-user.controller";
import { AddPaymentMethodToUserUseCase } from "@/domain/users/application/use-cases/user/payment-method/add-payment-method-to-user";
import { FetchUserPaymentMethodController } from "./controllers/shared-client-service-provider/payment-method/fetch-user-payment-method.controller";
import { SetupFirstSpecializationServiceProviderController } from "./controllers/create-account/create-account-sp/setup-first-specification-to-service-provider.controller";
import { SetupFirstSpecializationToServiceProviderUseCase } from "@/domain/users/application/use-cases/service-provider/register/setup-first-specification-to-service-provider";
import { UpdateServiceProviderProfileController } from "./controllers/service-provider/account/update-service-provider-profile";
import { FetchSubCategoryServicesController } from "./controllers/admin/categories/services/fetch-subcategories-services.controller";
import { FetchSubCategoryServicesUseCase } from "@/domain/work/application/use-case/categories/services/fetch-subcategory-services";
import { ClearUserNotificationController } from "./controllers/shared-client-service-provider/notifications/clear-user-notification.controller";
import { FetchUserNotificationsController } from "./controllers/shared-client-service-provider/notifications/fetch-user-notifications.controller";
import { ClearUserNotificationUseCase } from "@/domain/users/application/use-cases/user/notification/clear-user-notification";
import { SetUserNotificationReadedController } from "./controllers/shared-client-service-provider/notifications/set-user-notification-readed.controller";
import { AddQuestionOptionsController } from "./controllers/admin/questions/add-question-options.controller";
import { AddQuestionOptionsUseCase } from "@/domain/work/application/use-case/categories/questions/add-question-options";
import { AddQuestionController } from "./controllers/admin/questions/add-question.controller";
import { FetchRecentQuestionController } from "./controllers/admin/questions/fetch-questions.controller";
import { AddQuestionUseCase } from "@/domain/work/application/use-case/categories/questions/add-question";
import { FetchQuestionsUseCase } from "@/domain/work/application/use-case/categories/questions/fetch-questions";
import { UpdateQuestionStateController } from "./controllers/admin/questions/update-question-state.controller";
import { UpdateQuestionStateUseCase } from "@/domain/work/application/use-case/categories/questions/update-question-state";
import { AddTaskController } from "./controllers/client/task/add-task.controller";
import { AddTaskUseCase } from "@/domain/work/application/use-case/tasks/add-task";
import { FetchClientTaskController } from "./controllers/client/task/fetch-client-task.controller";
import { FetchClientTasksUseCase } from "@/domain/work/application/use-case/tasks/fetch-client-task";
import { PublishTaskController } from "./controllers/client/task/publish-task.controller";
import { PublishTaskUseCase } from "@/domain/work/application/use-case/tasks/publish-task";
import { UpdateTaskAddressController } from "./controllers/client/task/update-task-address";
import { UpdateTaskAddressUseCase } from "@/domain/work/application/use-case/tasks/update-task-address";
import { UpdateTaskQuestionController } from "./controllers/client/task/update-task-answer";
import { UpdateTaskQuestionUseCase } from "@/domain/work/application/use-case/tasks/update-task-question";
import { UploadTaskImageController } from "./controllers/client/task/update-task-images";
import { UpdateTaskServiceController } from "./controllers/client/task/update-task-service";
import { UpdateTaskStartDateController } from "./controllers/client/task/update-task-start-date.controller";
import { UpdateTaskImagesUseCase } from "@/domain/work/application/use-case/tasks/update-task-images";
import { UpdateTaskServiceUseCase } from "@/domain/work/application/use-case/tasks/update-task-service";
import { UpdateTaskStartDateUseCase } from "@/domain/work/application/use-case/tasks/update-task-start-date";
import { AddTaskDeleteReasonController } from "./controllers/admin/task-delete-reason/add-task-delete-reason.controller";
import { AddTaskDeleteReasonUseCase } from "@/domain/work/application/use-case/tasks/add-task-delete-reason";
import { UserDeleteTaskController } from "./controllers/client/task/user-delete-task.controller";
import { UserDeleteTaskUseCase } from "@/domain/work/application/use-case/tasks/user-delete-task";
import { ServiceProviderSendQuotationController } from "./controllers/service-provider/jobs/service-provider-send-quotation.controller";
import { ServiceProviderSendQuotationUseCase } from "@/domain/work/application/use-case/jobs/quotation/service-provider-send-quotation";
import { AcceptQuotationController } from "./controllers/client/quotation/accept-quotation.controller";
import { AcceptQuotationUseCase } from "@/domain/work/application/use-case/jobs/quotation/accept-quotation";
import { FetchRecentTaskDeleteReasonController } from "./controllers/admin/task-delete-reason/fetch-task-delete-reason.controller";
import { FetchTaskDeleteReasonUseCase } from "@/domain/work/application/use-case/tasks/fetch-task-delete-reason";
import { UpdateTaskBaseInfoController } from "./controllers/client/task/update-task-base-info.controller";
import { UpdateTaskBaseInfoUseCase } from "@/domain/work/application/use-case/tasks/update-task-base-info";
import { AddQuestionImageOptionsController } from "./controllers/admin/questions/add-question-image-options.controller";
import { AddQuestionImageOptionsUseCase } from "@/domain/work/application/use-case/categories/questions/add-question-image-options";
import { FetchServiceInAllCategoriesController } from "./controllers/admin/categories/services/fetch-service-in-all-categories.controller";
import { UpdateQuestionServiceController } from "./controllers/admin/questions/update-question-service-id.controller";
import { UpdateQuestionServiceUseCase } from "@/domain/work/application/use-case/categories/questions/update-question-service";
import { DeleteTaskTaskImageController } from "./controllers/client/task/delete-task-image.controller";
import { UserDeleteTaskImagesUseCase } from "@/domain/work/application/use-case/tasks/user-delete-task-image";
import { UpdatePrivateTaskServiceProvidersController } from "./controllers/client/task/update-private-task-service-providers.controller";
import { UpdatePrivateTaskServiceProvidersUseCase } from "@/domain/work/application/use-case/tasks/update-private-task-service-providers";
import { AddJobCancelReasonController } from "./controllers/admin/job-cancel-reason/add-job-cancel-reason.controller";
import { AddJobCancelReasonUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/add-cancel-delete-reason";
import { FetchJobCancelReasonController } from "./controllers/admin/job-cancel-reason/fetch-job-cancel-reason.controller";
import { FetchJobCancelReasonUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/fetch-job-cancel-reason";
import { AddQuotationRejectReasonController } from "./controllers/admin/quotation/add-quotation-reject-reason.controller";
import { AddQuotationRejectReasonUseCase } from "@/domain/work/application/use-case/jobs/quotation-reject-reason/add-quotation-reject-reason";
import { FetchQuotationRejectReasonController } from "./controllers/admin/quotation/fetch-quotation-reject-reason.controller";
import { FetchQuotationRejectReasonUseCase } from "@/domain/work/application/use-case/jobs/quotation-reject-reason/fetch-quotation-reject-reason";
import { ClientJobCancelController } from "./controllers/client/job/client-job-cancel.controller";
import { ClientCancelJobUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/client-job-cancel";
import { ResendOtpCodeUseCase } from "@/domain/users/application/use-cases/user/resend-otp-code";
import { SendForgotPasswordMailUseCase } from "@/domain/users/application/use-cases/user/send-forgot-password-mail";
import { RequestUpdateEmailUseCase } from "@/domain/users/application/use-cases/user/public/request-update-email";
import { RequestUpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/public/request-update-phone-number";
import { UpdateEmailUseCase } from "@/domain/users/application/use-cases/user/public/update-email";
import { UpdateAddressUseCase } from "@/domain/users/application/use-cases/user/address/update-address-draft-only-for-test";
import { FetchUserPromotionsUseCase } from "@/domain/users/application/use-cases/user/fetch-user-promotions";
import { UpdateUserDefaultLanguageUseCase } from "@/domain/users/application/use-cases/user/update-user-default-language";
import { SendRequestToRecoverPasswordUseCase } from "@/domain/users/application/use-cases/user/send-request-to-recover-password";
import { UpdateUserPasswordUseCase } from "@/domain/users/application/use-cases/user/update-user-password";
import { UpdateUserAddressUseCase } from "@/domain/users/application/use-cases/user/address/update-user-address";
import { SetUserAddressPrimaryUseCase } from "@/domain/users/application/use-cases/user/address/set-user-address-primary";
import { FetchUserPaymentMethodsUseCase } from "@/domain/users/application/use-cases/user/payment-method/fetch-user-payment-method";
import { UpdateServiceProviderProfileUseCase } from "@/domain/users/application/use-cases/service-provider/details/update-service-provider-profile";
import { FetchUserNotificationsUseCase } from "@/domain/users/application/use-cases/user/notification/fetch-user-notifications";
import { SetUserNotificationReadedUseCase } from "@/domain/users/application/use-cases/user/notification/set-user-notification-readed";
import { AuthRequestUpdateEmailController } from "./controllers/user/authenticated/profile/request-update-email.controller";
import { AuthRequestUpdatePhoneNumberController } from "./controllers/user/authenticated/profile/request-update-phone-number.controller";
import { AuthRequestUpdateEmailUseCase } from "@/domain/users/application/use-cases/user/auth/auth-request-update-email";
import { AuthRequestUpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/auth/auth-request-update-phone-number";
import { AuthUpdateEmailController } from "./controllers/user/authenticated/profile/update-email.controller";
import { AuthUpdateEmailUseCase } from "@/domain/users/application/use-cases/user/auth/auth-update-email";
import { AuthUpdatePhoneNumberController } from "./controllers/user/authenticated/profile/update-phone-number.controller";
import { AuthUpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/auth/auth-update-phone-number";
import { AddFileDisputeReasonController } from "./controllers/admin/dispute-reason/add-dispute-reason.controller";
import { AddFileDisputeReasonUseCase } from "@/domain/work/application/use-case/booking/add-file-dispute-reason";
import { StartFileDisputeController } from "./controllers/shared-client-service-provider/file-dispute/start-file-dispute.controller";
import { StartFileDisputeUseCase } from "@/domain/work/application/use-case/booking/start-file-dispute";
import { SendReviewAndRatingController } from "./controllers/shared-client-service-provider/review-rating/send-review-and-rating.controller";
import { SendReviewAndRatingUseCase } from "@/domain/work/application/use-case/booking/send-review-and-rating";
import { UserDeleteJobController } from "./controllers/client/job/user-delete-job.controller";
import { UserDeleteJobUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/user-delete-job";
import { NotificationModule } from "../notification/notification.module";
import { FetchServiceProviderNearJobsController } from "./controllers/service-provider/jobs/fetch-near-jobs.controller";
import { FetchServiceProviderNearJobsUseCase } from "@/domain/work/application/use-case/jobs/fetch-service-provider-near-jobs";
import { FetchServiceProviderBookingController } from "./controllers/service-provider/bookings/fetch-service-provider-bookings.controller";
import { FetchServiceProviderBookingsUseCase } from "@/domain/work/application/use-case/booking/service-provider/service-provider-fetch-booking";
import { SendRequestToFinishBookingController } from "./controllers/service-provider/bookings/send-request-to-finish-booking.controller";
import { SendRequestToFinishBookingUseCase } from "@/domain/work/application/use-case/booking/service-provider/send-request-to-finish-booking";
import { SendRequestToStartBookingController } from "./controllers/service-provider/bookings/send-request-to-start-booking.controller";
import { SendRequestToStartBookingUseCase } from "@/domain/work/application/use-case/booking/service-provider/send-request-to-start-booking";
import { AcceptToFinishBookingController } from "./controllers/client/bookings/accept-complete-booking.controller";
import { AcceptToFinishBookingUseCase } from "@/domain/work/application/use-case/booking/client/accept-to-finish-booking";
import { AcceptToStartBookingController } from "./controllers/client/bookings/accept-to-start-booking.controller";
import { AcceptToStartBookingUseCase } from "@/domain/work/application/use-case/booking/client/accept-to-start-booking";
import { DenyToFinishBookingController } from "./controllers/client/bookings/deny-complete-booking.controller";
import { DenyToFinishBookingUseCase } from "@/domain/work/application/use-case/booking/client/deny-to-finish-booking";
import { DenyToStartBookingController } from "./controllers/client/bookings/deny-start-booking.controller";
import { DenyToStartBookingUseCase } from "@/domain/work/application/use-case/booking/client/deny-to-start-booking";
import { FetchClientBookingController } from "./controllers/client/bookings/fetch-client-bookings.controller";
import { FetchClientBookingsUseCase } from "@/domain/work/application/use-case/booking/client/client-fetch-booking";
import { FetchJobDetailsController } from "./controllers/client/job/fetch-jobs-details.controller";
import { FetchJobDetailsJobsUseCase } from "@/domain/work/application/use-case/jobs/fetch-jobs-details";
import { FetchJobsController } from "./controllers/client/job/fetch-jobs.controller";
import { FetchClientJobsUseCase } from "@/domain/work/application/use-case/jobs/fetch-client-jobs";
import { RejectQuotationController } from "./controllers/client/quotation/reject-quotation.controller";
import { RejectQuotationUseCase } from "@/domain/work/application/use-case/jobs/quotation/reject-quotation";
import { FetchUserWalletBalanceController } from "./controllers/service-provider/wallet/fetch-wallet-balance.controller";
import { FetchCreditTransactionHistoryController } from "./controllers/service-provider/wallet/fetch-credit-transaction-history.controller";
import { FetchUserTransactionHistoryUseCase } from "@/domain/payment/application/use-case/fetch-user-transaction-history";
import { PurchaseCreditController } from "./controllers/service-provider/wallet/purchase-credit.controller";
import { FetchUserWalletBalanceUseCase } from "@/domain/payment/application/use-case/fetch-user-wallet-balance";
import { PurchaseCreditUseCase } from "@/domain/payment/application/use-case/purchase-credit";
import { AddMoneyOnWalletController } from "./controllers/shared-client-service-provider/wallet/add-money.controller";
import { AddMoneyOnWalletUseCase } from "@/domain/payment/application/use-case/add-money-on-wallet";
import { FetchServiceProviderOfServiceController } from "./controllers/admin/service-provider/fetch-service-provider-of-service.controller";
import { FetchServiceProviderOfServiceUseCase } from "@/domain/users/application/use-cases/user/fetch-service-provider-of-service";
import { UpdateTaskPrivateServiceProvidersController } from "./controllers/client/task/update-task-service-providers.controller";
import { UpdateTaskPrivateServiceProvidersUseCase } from "@/domain/work/application/use-case/tasks/update-task-private-service-providers";
import { LogoutController } from "./controllers/session/logout.controller";
import { RefreshTokenController } from "./controllers/session/refresh-token.controller";
import { LogoutUserUseCase } from "@/domain/users/application/use-cases/user/logout-user";
import { RefreshTokenUserUseCase } from "@/domain/users/application/use-cases/user/refresh-user-token";
import { ForceLogoutController } from "./controllers/session/force-logout.controller";
import { SocialAuthenticationUserUseCase } from "@/domain/users/application/use-cases/user/social-authentication";
import { FetchClientServiceProviderDetailsController } from "./controllers/client/service-provider/fetch-client-service-provider-details.controller";
import { FetchServiceProviderDetailsUseCase } from "@/domain/users/application/use-cases/service-provider/details/fetch-service-provider-details";
import { FetchClientServiceProviderFavoritesController } from "./controllers/client/service-provider-favorite/fetch-client-service-provider-favorites.controller";
import { FetchClientServiceProviderFavoriteUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-favorite";
import { FetchClientServiceProviderBookingController } from "./controllers/client/service-provider/fetch-client-service-provider-bookings.controller";
import { FetchClientServiceProviderBookingsUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-bookings";
import { FetchClientServiceProviderPortfolioController } from "./controllers/client/service-provider/fetch-client-service-provider-portfolios.controller";
import { FetchClientServiceProviderPortfoliosUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-portfolios";
import { FetchClientServiceProviderSpecializationController } from "./controllers/client/service-provider/fetch-client-service-provider-specialization.controller";
import { FetchClientServiceProviderSpecializationsUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-specializations";
import { ClientAddServiceProviderFavoriteController } from "./controllers/client/service-provider-favorite/client-add-service-provider-as-favorite.controller";
import { AddClientServiceProviderFavoriteUseCase } from "@/domain/users/application/use-cases/client/add-client-service-provider-favorite";
import { FetchClientServiceProviderDetailsUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-details";
import { FetchClientServiceProviderController } from "./controllers/client/service-provider/fetch-client-service-providers.controller";
import { FetchClientServiceProviderUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider";
import { ValidationService } from "./pipes/validation.service";
import { DeleteNotificationItemController } from "./controllers/shared-client-service-provider/notifications/delete-user-notification-item.controller";
import { DeleteNotificationItemUseCase } from "@/domain/users/application/use-cases/user/notification/delete-user-notification-item";
import { FetchWalletTransactionHistoryController } from "./controllers/shared-client-service-provider/wallet/fetch-wallet-transaction-history.controller";
import { EditPaymentMethodToUserController } from "./controllers/shared-client-service-provider/payment-method/edit-payment-method-to-user.controller";
import { EditPaymentMethodToUserUseCase } from "@/domain/users/application/use-cases/user/payment-method/edit-payment-method-to-user";
import { SetQuotationAsReadController } from "./controllers/client/quotation/set-quotation-as-read.controller";
import { SetQuotationAsReadUseCase } from "@/domain/work/application/use-case/jobs/quotation/set-quotation-as-read";
import { GetJobsNotViewedUseCase } from "@/domain/work/application/use-case/jobs/get-jobs-not-viewed";
import { FetchClientWalletBalanceController } from "./controllers/client/wallet/fetch-client-wallet-balance.controller";
import { FetchClientWalletBalanceUseCase } from "@/domain/payment/application/use-case/fetch-client-wallet-balance";
import { WithdrawMoneyOnWalletController } from "./controllers/shared-client-service-provider/wallet/withdraw-money.controller";
import { WithdrawMoneyOnWalletUseCase } from "@/domain/payment/application/use-case/withdraw-money-on-wallet";
import { FetchReviewAndRatingController } from "./controllers/shared-client-service-provider/review-rating/fetch-review-and-rating.controller";
import { FetchReviewAndRatingUseCase } from "@/domain/work/application/use-case/booking/fetch-review-and-rating";
import { FetchFileDisputeReasonController } from "./controllers/admin/dispute-reason/fetch-dispute-reason.controller";
import { FetchFileDisputeReasonUseCase } from "@/domain/work/application/use-case/booking/fetch-file-dispute-reason";
import { FetchBookingFileDisputeController } from "./controllers/shared-client-service-provider/file-dispute/fetch-booking-file-dispute.controller";
import { FetchBookingFileDisputeUseCase } from "@/domain/work/application/use-case/booking/fetch-booking-file-dispute";
import { FetchConversationsUseCase } from "@/domain/work/application/use-case/conversation/fetch-conversations";
import { JoinConversationUseCase } from "@/domain/work/application/use-case/conversation/join-conversation";
import { SaveMessageUseCase } from "@/domain/work/application/use-case/conversation/save-message";
import { LeaveConversationUseCase } from "@/domain/work/application/use-case/conversation/leave-conversation";
import { FetchMessagesUseCase } from "@/domain/work/application/use-case/conversation/fetch-messages";
import { AddSubscriptionPlanController } from "./controllers/admin/subscriptions/add-subscription-plan.controller";
import { AddSubscriptionPlantUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/add-subscription-plan";
import { FetchSubscriptionPlansController } from "./controllers/admin/subscriptions/fetch-subscription-plan.controller";
import { FetchSubscriptionPlansUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/fetch-subscription-plan";
import { PublishSubscriptionPlansController } from "./controllers/admin/subscriptions/publish-subscription-plan.controller";
import { PublishSubscriptionPlanUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/publish-subscription-plans";
import { AddPublishSubscriptionPlanDiscountController } from "./controllers/admin/subscriptions/add-subscription-plan-discount-commission.controller";
import { AddDiscountCommissionUseCase } from "@/domain/subscriptions/applications/use-cases/discount-commission/add-discount-commission";
import { PurchaseSubscriptionPlanController } from "./controllers/service-provider/subscription/purchase-subscription.controller";
import { PurchaseSubscriptionUseCase } from "@/domain/subscriptions/applications/use-cases/subscription/purchase-subscription";
import { FetchServiceProviderSubscriptionsController } from "./controllers/service-provider/subscription/fetch-service-provider-subscriptions.controller";
import { FetchServiceProviderSubscriptionsUseCase } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-service-provider-subscriptions";
import { FetchClientsController } from "./controllers/admin/clients/fetch-clients.controller";
import { FetchClientsUseCase } from "@/domain/users/application/use-cases/client/fetch-clients";
import { FilesController } from "./controllers/test-upload";
import { ValidateReferralCodeController } from "./controllers/shared-client-service-provider/referral/validate-referral.controller";
import { ValidateReferralCodeUseCase } from "@/domain/users/application/use-cases/referral-code/validate-referral-code";
import { UpdateServiceProviderStateController } from "./controllers/admin/service-provider/update-service-provider-state.controller";
import { UpdateServiceProviderStateUseCase } from "@/domain/users/application/use-cases/service-provider/details/update-service-provider-state";
import { ActiveServiceProviderController } from "./controllers/service-provider/account/active-service-provider.controller";
import { ActiveServiceProviderUseCase } from "@/domain/users/application/use-cases/service-provider/details/active-service-provider";
import { PaymentController } from "./controllers/payment/payment.controller";
import { PushNotificationTokenController } from "./controllers/session/push-notification-token.controller";
import { FetchConversationController } from "./controllers/shared-client-service-provider/chat/fetch-conversation.controller";
import { AddClientInquireController } from "./controllers/inquire/add-client-inquire.controllet";
import { AddServiceProviderInquireController } from "./controllers/inquire/add-service-provider-inquire.controller";
import { AddClientInquireUseCase } from "@/domain/inquire/application/use-cases/client/add-client-inquire";
import { AddServiceProviderInquireUseCase } from "@/domain/inquire/application/use-cases/service-provider-inquire.ts/add-service-provider-inquire";
import { ListInquireController } from "./controllers/inquire/list-all-inquire.controller";
import { FetchInquireUseCase } from "@/domain/inquire/application/use-cases/fetch-inquire";
import { FetchCategoryServicesController } from "./controllers/admin/categories/services/fetch-categories-services.controller";
import { FetchServicesByCategoryUseCase } from "@/domain/work/application/use-case/categories/services/fetch-services-by-category";
import { FetchActivitiesController } from "./controllers/user/authenticated/profile/fetch-activity.controller";
import { FetchActivitiesUseCase } from "@/domain/users/application/use-cases/user/activities/fetch-activities";
import { SocialAuthenticateController } from "./controllers/session/social-authenticate.controller";
import { SocialAuthenticateUseCase } from "@/domain/users/application/use-cases/user/authentication/social-authenticate";
import { RequestDeleteAccountController } from "./controllers/shared-client-service-provider/delete-account/request-delete-account.controller";
import { RequestDeleteAccountUseCase } from "@/domain/users/application/use-cases/user/account/request-delete-account";
import { SetJobAsViewedController } from "./controllers/service-provider/jobs/set-job-as-viewed.controller";
import { SetJobAsViewedUseCase } from "@/domain/work/application/use-case/jobs/set-job-as-viewed";
import { FetchServiceProviderBookingDetailsController } from "./controllers/service-provider/bookings/fetch-service-provider-booking-details.controller";
import { FetchServiceProviderBookingDetailsUseCase } from "@/domain/work/application/use-case/booking/service-provider/service-provider-fetch-booking-details";
import { FetchAccountOverviewController } from "./controllers/service-provider/wallet/fetch-account-overview.controller";
import { FetchAccountOverviewUseCase } from "@/domain/users/application/use-cases/service-provider/wallet/fetch-account-overview";
import { FetchCreditPackageController } from "./controllers/admin/credit-package/fetch-credit-package.controller";
import { AddCreditPackageController } from "./controllers/admin/credit-package/add-credit-package.controller";
import { FetchCreditPackageUseCase } from "@/domain/subscriptions/applications/use-cases/credit-package/fetch-credit-package";
import { AddCreditPackageUseCase } from "@/domain/subscriptions/applications/use-cases/credit-package/add-credit-package";
import { FetchClientServiceProviderByServiceController } from "./controllers/client/service-provider/fetch-service-provider-by-service.controller";
import { FetchClientServiceProviderByService } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-by-services";
import { SendMessageController } from "./controllers/shared-client-service-provider/chat/send-message.controller";
import { FetchMessagesController } from "./controllers/shared-client-service-provider/chat/fetch-messages.controller";
import { UpdateUserProfileImageController } from "./controllers/user/authenticated/profile/update-user-profile-image.controller";
import { UpdateUserProfileImageCase } from "@/domain/users/application/use-cases/user/update-user-profile-image";
import { UpdateCategoryController } from "./controllers/admin/categories/categories/update-categories.controller";
import { UpdateServiceController } from "./controllers/admin/categories/services/update-service.controller";
import { UpdateSubCategoryController } from "./controllers/admin/categories/subcategories/update-subcategory.controller";
import { UpdateSubSubCategoryController } from "./controllers/admin/categories/subsubcategories/update-sub-subcategory.controller";
import { UpdateCategoryUseCase } from "@/domain/work/application/use-case/categories/category/update-category";
import { UpdateSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-category/update-subcategory";
import { UpdateSubSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/update-sub-subcategory";
import { UpdateServiceUseCase } from "@/domain/work/application/use-case/categories/services/update-service";
import { UpdateTaskCategoryController } from "./controllers/client/task/update-task-category.controller";
import { UpdateTaskSubCategoryController } from "./controllers/client/task/update-task-sub-category.controller";
import { UpdateTaskSubSubCategoryController } from "./controllers/client/task/update-task-sub-sub-category.controller";
import { UpdateTaskCategoryIdUseCase } from "@/domain/work/application/use-case/tasks/update-task-category-id";
import { UpdateTaskSubCategoryIdUseCase } from "@/domain/work/application/use-case/tasks/update-task-sub-category-id";
import { UpdateTaskSubSubCategoryIdUseCase } from "@/domain/work/application/use-case/tasks/update-sub-sub-category-id";
import { UpdateTaskDraftStateController } from "./controllers/client/task/update-task-draft-state.controller";
import { UpdateTaskDraftStateUseCase } from "@/domain/work/application/use-case/tasks/update-task-draft-state";
import { DocumentController } from "./controllers/document/document.controller";
import { FetchUserTransactionCreditHistoryUseCase } from "@/domain/payment/application/use-case/fetch-user-transaction-credit-history";
import { DownloadInvoiceController } from "./controllers/shared-client-service-provider/wallet/download-invoice.controller";
import { WebsocketModule } from "../websocket/websocket.module";
import { FetchUserTransactionDetailsUseCase } from "@/domain/payment/application/use-case/fetch-user-transaction-details";
import { FetchUserDetailsUseCase } from "@/domain/users/application/use-cases/user/account/fetch-user-details";
import { FetchWalletDetailsUseCase } from "@/domain/payment/application/use-case/fetch-wallet-details";
import { FetchActiveServiceProviderSubscriptionUseCase } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-active-service-provider-subscription";
import { FetchSubscriptionPlanDetailsUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/fetch-subscription-plan-details";
import { FetchUserTransactionDetailsController } from "./controllers/shared-client-service-provider/wallet/fetch-wallet-transaction-details.controller";
import { FetchQuotationDetailsController } from "./controllers/shared-client-service-provider/quotation/fetch-quotation-details";
import { FetchQuotationDetailsUseCase } from "@/domain/work/application/use-case/jobs/quotation/fetch-quotation.details";
import { FetchAllServiceProviderController } from "./controllers/admin/service-provider/fetch-service-providers.controller";
import { FetchServiceProvidersUseCase } from "@/domain/users/application/use-cases/client/fetch-service-providers";
import { AuthenticatedWithoutPasswordController } from "./controllers/create-account/validation/authenticate-on-create-account.controller";
import { FetchSpQuotationsInJobController } from "./controllers/client/quotation/fetch-sp-quotation-in-job.controller";
import { FetchSpQuotationInJobUseCase } from "@/domain/work/application/use-case/jobs/quotation/fetch-sp-quotation-in-job";
import { SessionHydrateController } from "./controllers/session/session-hydrate.controller";
import { SessionHydrateUseCase } from "@/domain/users/application/use-cases/user/authentication/session-hydate";
import { SetAllUserNotificationReadedController } from "./controllers/shared-client-service-provider/notifications/set-all-user-notification-as-readed.controller";
import { SetAllUserNotificationReadedUseCase } from "@/domain/users/application/use-cases/user/notification/set-all-user-notification-readed";
import { FetchClientBookingDetailsController } from "./controllers/client/bookings/fetch-client-booking-details.controller";
import { FetchClientBookingDetailsUseCase } from "@/domain/work/application/use-case/booking/client/fetch-client-booking-details";
import { DownloadClientInquiredController } from "./controllers/inquire/download-client-inquires.controller";
import { DownloadSpInquiredController } from "./controllers/inquire/download-sp-inquires.controller";
import { UpdateUserNotificationTokenUseCase } from "@/domain/users/application/use-cases/user/update-user-notification-token";
import { UpdateNotificationTokenController } from "./controllers/user/authenticated/profile/update-expo-notification-token.controller";
import { SessionBackofficeController } from "./controllers/session/session-backoffice.controller";
import { SessionBackofficeUseCase } from "@/domain/users/application/use-cases/user/authentication/session-backoffice";
import { BackofficeController } from "./controllers/backoffice/backoffice.controller";
import { GetUserByIdUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/get-user-details-by-id";
import { PrismaHelpersRatingAndFavoriteRepository } from "../database/prisma/prisma-common-helpers.service";
import { UpdateUserStateUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/update-user-state";
import { SendRequestToRecoverBackofficePasswordUseCase } from "@/domain/users/application/use-cases/user/send-request-to-recover-backoffice-password";
import { BcryptHasher } from "../cryptography/bcrypt-hasher";
import { UsersManagementGetSummaryUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/get-users-management-summary";
import { GetUsersByAccountTypeUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/get-users-by-account-type";
import { ExportUsersUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/export-users";
import { ExcelModule } from "../xlsx/xlsx.module";

@Module({
  imports: [
    DatabaseModule,
    CryptographyModule,
    MailModule,
    SMSModule,
    DateModule,
    StorageModule,
    NotificationModule,
    WebsocketModule,
    ExcelModule,
  ],
  providers: [
    FetchConversationsUseCase,
    JoinConversationUseCase,
    LeaveConversationUseCase,
    FetchMessagesUseCase,
    SaveMessageUseCase,
    EnvService,
    RegisterClientUseCase,
    OtpValidationUseCase,
    ResendOtpCodeUseCase,
    SendForgotPasswordMailUseCase,
    AuthenticateUserUseCase,
    UploadDocumentUseCase,
    RegisterServiceProviderUseCase,
    SetupServiceProviderPasswordUseCase,
    CreateCategoryUseCase,
    FetchCategoriesUseCase,
    UpdateCategoryImageUseCase,
    CreateSubCategoryUseCase,
    CreateSubSubCategoryUseCase,
    UpdateSubCategoryImageUseCase,
    UpdateSubSubCategoryImageUseCase,
    CreateServiceUseCase,
    FetchServicesUseCase,
    FetchSubSubCategoriesUseCase,
    FetchSubCategoriesUseCase,
    AddServiceProviderPortfolioUseCase,
    AddServiceProviderSpecializationUseCase,
    UpdateServiceProviderSpecializationUseCase,
    UpdateServiceProviderPortfolioUseCase,
    DeleteServiceProviderSpecializationUseCase,
    DeleteServiceProviderPortfolioUseCase,
    FetchServiceProviderPortfoliosUseCase,
    FetchServiceProviderSpecializationsUseCase,
    RequestUpdateEmailUseCase,
    RequestUpdatePhoneNumberUseCase,
    UpdateEmailUseCase,
    UpdatePhoneNumberUseCase,
    UpdateAddressUseCase,
    CreatePromotionUseCase,
    FetchPromotionsUseCase,
    AddPromotionToUserUseCase,
    FetchUserPromotionsUseCase,
    UpdateUserDefaultLanguageUseCase,
    SendRequestToRecoverPasswordUseCase,
    RecoverPasswordUpdateUseCase,
    UpdateUserPasswordUseCase,
    UpdateUserNotificationTokenUseCase,
    EtherealMailSender,
    SendGridService,

    UpdateUserProfileCase,
    UpdateUserAddressUseCase,
    FetchUserAddressesUseCase,
    SetUserAddressPrimaryUseCase,
    AddAddressToUserUseCase,
    DeleteUserAddressUseCase,
    AddPaymentMethodToUserUseCase,
    FetchUserPaymentMethodsUseCase,
    SetupFirstSpecializationToServiceProviderUseCase,
    UpdateServiceProviderProfileUseCase,
    FetchSubCategoryServicesUseCase,
    ClearUserNotificationUseCase,
    FetchUserNotificationsUseCase,
    SetUserNotificationReadedUseCase,
    AddQuestionOptionsUseCase,
    AddQuestionUseCase,
    FetchQuestionsUseCase,
    UpdateQuestionStateUseCase,
    AddTaskUseCase,
    FetchClientTasksUseCase,
    PublishTaskUseCase,
    UpdateTaskAddressUseCase,
    UpdateTaskQuestionUseCase,
    UpdateTaskImagesUseCase,
    UpdateTaskServiceUseCase,
    UpdateTaskStartDateUseCase,
    AddTaskDeleteReasonUseCase,
    UserDeleteTaskUseCase,
    ServiceProviderSendQuotationUseCase,
    ClientCancelJobUseCase,
    AcceptQuotationUseCase,
    FetchTaskDeleteReasonUseCase,
    UpdateTaskBaseInfoUseCase,
    AddQuestionImageOptionsUseCase,
    UpdateQuestionServiceUseCase,
    UserDeleteTaskImagesUseCase,
    UpdatePrivateTaskServiceProvidersUseCase,
    AddJobCancelReasonUseCase,
    FetchJobCancelReasonUseCase,
    AddQuotationRejectReasonUseCase,
    FetchQuotationRejectReasonUseCase,
    AuthRequestUpdateEmailUseCase,
    AuthRequestUpdatePhoneNumberUseCase,
    AuthUpdateEmailUseCase,
    AuthUpdatePhoneNumberUseCase,
    AddFileDisputeReasonUseCase,
    StartFileDisputeUseCase,
    SendReviewAndRatingUseCase,
    UserDeleteJobUseCase,
    FetchServiceProviderNearJobsUseCase,
    FetchServiceProviderBookingsUseCase,
    SendRequestToFinishBookingUseCase,
    SendRequestToStartBookingUseCase,
    AcceptToFinishBookingUseCase,
    AcceptToStartBookingUseCase,
    DenyToFinishBookingUseCase,
    DenyToStartBookingUseCase,
    FetchClientBookingsUseCase,
    FetchJobDetailsJobsUseCase,
    FetchClientJobsUseCase,
    RejectQuotationUseCase,
    FetchUserWalletBalanceUseCase,
    FetchUserTransactionHistoryUseCase,
    PurchaseCreditUseCase,
    AddMoneyOnWalletUseCase,
    FetchServiceProviderOfServiceUseCase,
    UpdateTaskPrivateServiceProvidersUseCase,
    LogoutUserUseCase,
    RefreshTokenUserUseCase,
    SocialAuthenticationUserUseCase,
    FetchServiceProviderDetailsUseCase,
    FetchClientServiceProviderFavoriteUseCase,
    FetchClientServiceProviderBookingsUseCase,
    FetchClientServiceProviderPortfoliosUseCase,
    FetchClientServiceProviderSpecializationsUseCase,
    AddClientServiceProviderFavoriteUseCase,
    FetchClientServiceProviderDetailsUseCase,
    FetchClientServiceProviderUseCase,
    ValidationService,
    DeleteNotificationItemUseCase,
    EditPaymentMethodToUserUseCase,
    SetQuotationAsReadUseCase,
    GetJobsNotViewedUseCase,
    FetchClientWalletBalanceUseCase,
    WithdrawMoneyOnWalletUseCase,
    FetchReviewAndRatingUseCase,
    FetchFileDisputeReasonUseCase,
    FetchBookingFileDisputeUseCase,
    AddSubscriptionPlantUseCase,
    FetchSubscriptionPlansUseCase,
    PublishSubscriptionPlanUseCase,
    AddDiscountCommissionUseCase,
    PurchaseSubscriptionUseCase,
    FetchServiceProviderSubscriptionsUseCase,
    FetchClientsUseCase,
    ValidateReferralCodeUseCase,
    UpdateServiceProviderStateUseCase,
    ActiveServiceProviderUseCase,
    AddClientInquireUseCase,
    AddServiceProviderInquireUseCase,
    FetchInquireUseCase,
    FetchServicesByCategoryUseCase,
    FetchActivitiesUseCase,
    SocialAuthenticateUseCase,
    RequestDeleteAccountUseCase,
    SetJobAsViewedUseCase,
    FetchServiceProviderBookingDetailsUseCase,
    FetchAccountOverviewUseCase,
    FetchCreditPackageUseCase,
    AddCreditPackageUseCase,
    FetchClientServiceProviderByService,
    UpdateUserProfileImageCase,
    UpdateCategoryUseCase,
    UpdateSubCategoryUseCase,
    UpdateSubSubCategoryUseCase,
    UpdateServiceUseCase,
    UpdateTaskCategoryIdUseCase,
    UpdateTaskSubCategoryIdUseCase,
    UpdateTaskSubSubCategoryIdUseCase,
    UpdateTaskDraftStateUseCase,
    FetchUserTransactionCreditHistoryUseCase,
    FetchUserTransactionDetailsUseCase,
    FetchUserDetailsUseCase,
    FetchWalletDetailsUseCase,
    FetchActiveServiceProviderSubscriptionUseCase,
    FetchSubscriptionPlanDetailsUseCase,
    FetchQuotationDetailsUseCase,
    FetchServiceProvidersUseCase,
    FetchSpQuotationInJobUseCase,
    SessionHydrateUseCase,
    SetAllUserNotificationReadedUseCase,
    FetchClientBookingDetailsUseCase,
    SessionBackofficeUseCase,
    GetUserByIdUseCase,
    PrismaHelpersRatingAndFavoriteRepository,
    UpdateUserStateUseCase,
    SendRequestToRecoverBackofficePasswordUseCase,
    BcryptHasher,
    UsersManagementGetSummaryUseCase,
    GetUsersByAccountTypeUseCase,
    ExportUsersUseCase,
  ],
  controllers: [
    AuthenticatedWithoutPasswordController,
    DownloadClientInquiredController,
    DownloadSpInquiredController,
    FetchSpQuotationsInJobController,
    FetchClientBookingDetailsController,
    SessionHydrateController,
    SetAllUserNotificationReadedController,
    FetchAllServiceProviderController,
    FetchUserTransactionDetailsController,
    FetchQuotationDetailsController,
    RegisterClientController,
    ValidateEmailController,
    ValidatePhoneController,
    ResendPhoneOtpController,
    ResendEmailOtpController,
    SendForgotPasswordMailController,
    AuthenticatedController,
    UploadNifBIController,
    RegisterServiceProviderController,
    UpdatePasswordController,
    SetupPasswordController,
    CreateCategoryController,
    FetchRecentCategoryController,
    UpdateCategoryImageController,
    CreateSubCategoryController,
    CreateSubSubCategoryController,
    UpdateSubCategoryImageController,
    UpdateSubSubCategoryImageController,
    CreateServiceController,
    FetchRecentServiceController,
    FetchRecentSubSubCategoryController,
    FetchRecentSubCategoryController,
    AddServiceProviderPortfolioController,
    AddServiceProviderSpecializationController,
    UpdateServiceProviderSpecializationController,
    UpdateServiceProviderPortfolioController,
    DeleteServiceProviderPortfolioController,
    DeleteServiceProviderSpecializationController,
    FetchServiceProviderPortfolioController,
    FetchServiceProviderSpecializationController,
    RequestUpdateEmailController,
    RequestUpdatePhoneNumberController,
    UpdateEmailController,
    UpdatePhoneNumberController,
    UpdateAddressController,
    CreatePromotionController,
    FetchRecentPromotionController,
    AddPromotionToUserController,
    FetchRecentUserPromotionController,
    UpdateUserDefaultLanguageController,
    UpdateNotificationTokenController,
    SendRequestToRecoverPasswordController,
    RecoverPasswordUpdateController,
    ValidateOTPController,
    UpdateUserProfileController,
    FetchUserAddressController,
    SetUserAddressPrimaryController,
    UpdateUserAddressController,
    AddAddressToUserController,
    DeleteUserAddressController,
    AddPaymentMethodToUserController,
    FetchUserPaymentMethodController,
    SetupFirstSpecializationServiceProviderController,
    UpdateServiceProviderProfileController,
    FetchSubCategoryServicesController,
    ClearUserNotificationController,
    FetchUserNotificationsController,
    SetUserNotificationReadedController,
    AddQuestionOptionsController,
    AddQuestionController,
    FetchRecentQuestionController,
    UpdateQuestionStateController,
    AddTaskController,
    FetchClientTaskController,
    PublishTaskController,
    UpdateTaskAddressController,
    UpdateTaskQuestionController,
    UploadTaskImageController,
    UpdateTaskServiceController,
    UpdateTaskStartDateController,
    AddTaskDeleteReasonController,
    UserDeleteTaskController,
    ServiceProviderSendQuotationController,
    ClientJobCancelController,
    AcceptQuotationController,
    FetchRecentTaskDeleteReasonController,
    UpdateTaskBaseInfoController,
    AddQuestionImageOptionsController,
    FetchServiceInAllCategoriesController,
    UpdateQuestionServiceController,
    DeleteTaskTaskImageController,
    UpdatePrivateTaskServiceProvidersController,
    AddJobCancelReasonController,
    FetchJobCancelReasonController,
    AddQuotationRejectReasonController,
    FetchQuotationRejectReasonController,
    AuthRequestUpdateEmailController,
    AuthRequestUpdatePhoneNumberController,
    AuthUpdateEmailController,
    AuthUpdatePhoneNumberController,
    AddFileDisputeReasonController,
    StartFileDisputeController,
    SendReviewAndRatingController,
    UserDeleteJobController,
    FetchServiceProviderNearJobsController,
    FetchServiceProviderBookingController,
    SendRequestToFinishBookingController,
    SendRequestToStartBookingController,
    AcceptToFinishBookingController,
    AcceptToStartBookingController,
    DenyToFinishBookingController,
    DenyToStartBookingController,
    FetchClientBookingController,
    FetchJobDetailsController,
    FetchJobsController,
    RejectQuotationController,
    FetchUserWalletBalanceController,
    FetchCreditTransactionHistoryController,
    PurchaseCreditController,
    AddMoneyOnWalletController,
    FetchServiceProviderOfServiceController,
    UpdateTaskPrivateServiceProvidersController,
    LogoutController,
    RefreshTokenController,
    ForceLogoutController,
    SocialAuthenticateController,
    FetchClientServiceProviderDetailsController,
    FetchClientServiceProviderFavoritesController,
    FetchClientServiceProviderBookingController,
    FetchClientServiceProviderPortfolioController,
    FetchClientServiceProviderSpecializationController,
    ClientAddServiceProviderFavoriteController,
    FetchClientServiceProviderController,
    DeleteNotificationItemController,
    FetchWalletTransactionHistoryController,
    EditPaymentMethodToUserController,
    SetQuotationAsReadController,
    FetchClientWalletBalanceController,
    WithdrawMoneyOnWalletController,
    FetchReviewAndRatingController,
    FetchFileDisputeReasonController,
    FetchBookingFileDisputeController,
    AddSubscriptionPlanController,
    FetchSubscriptionPlansController,
    PublishSubscriptionPlansController,
    AddPublishSubscriptionPlanDiscountController,
    PurchaseSubscriptionPlanController,
    FetchServiceProviderSubscriptionsController,
    FetchClientsController,
    FilesController,
    ValidateReferralCodeController,
    UpdateServiceProviderStateController,
    ActiveServiceProviderController,
    PaymentController,
    PushNotificationTokenController,
    FetchConversationController,
    AddClientInquireController,
    AddServiceProviderInquireController,
    ListInquireController,
    FetchCategoryServicesController,
    FetchActivitiesController,
    RequestDeleteAccountController,
    SetJobAsViewedController,
    FetchServiceProviderBookingDetailsController,
    FetchAccountOverviewController,
    FetchCreditPackageController,
    AddCreditPackageController,
    FetchClientServiceProviderByServiceController,
    SendMessageController,
    FetchMessagesController,
    UpdateUserProfileImageController,
    UpdateCategoryController,
    UpdateSubCategoryController,
    UpdateSubSubCategoryController,
    UpdateServiceController,
    UpdateTaskCategoryController,
    UpdateTaskSubCategoryController,
    UpdateTaskSubSubCategoryController,
    UpdateTaskDraftStateController,
    DocumentController,
    DownloadInvoiceController,
    SessionBackofficeController,
    BackofficeController,
  ],
})
export class HttpModule {}
