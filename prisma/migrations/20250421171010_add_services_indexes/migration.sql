-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('Active', 'Inactive', 'SetupAccount', 'UnderReview', 'RequestDelete');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'NotTell');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('Client', 'ServiceProvider', 'SuperAdmin');

-- CreateEnum
CREATE TYPE "OTPFor" AS ENUM ('Email', 'PhoneNumber', 'Password');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PrimaryEducation', 'SecondaryEducation', 'HigherEducation', 'GraduateEducation', 'ProfessionalDegrees');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NIF', 'BI_FRONT', 'BI_BACK');

-- CreateEnum
CREATE TYPE "Rate" AS ENUM ('FIXED', 'HOURLY');

-- CreateEnum
CREATE TYPE "UserPromotionState" AS ENUM ('PENDING', 'USED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('PORTUGUESE', 'ENGLISH');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RegisterSuccess', 'NewOfferReceivedQuotation', 'RequestToCompleteJob', 'RequestToStartJob', 'JobExpired', 'MoneyAddedToWallet', 'MoneyWithdraw', 'Promotions', 'JobDisputeRaised', 'JobDisputeClosed', 'JobCompleteAutoApproval', 'JobQuoted', 'JobAccepted', 'JobQuotedRejected', 'RequestToStartJobDenied', 'RequestToStartJobAccepted', 'RequestToCompleteJobDenied', 'RequestToCompleteJobAccepted', 'BookingStartIn1Hour', 'BookingStartIn15Minutes', 'SubscriptionAboutExpire', 'PurchaseCredit');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google', 'apple', 'facebook');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('Percentage', 'Money');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PushNotificationStatus" AS ENUM ('PENDING', 'SENDED');

-- CreateEnum
CREATE TYPE "PushNotificationRedirectTo" AS ENUM ('DASHBOARD', 'JOBDETAILS', 'EMPTY', 'BOOKINGDETAILS', 'QUOTATIONDETAILS', 'TRANSACTIONDETAILS');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SIMPLE', 'SINGLE_SELECT', 'SINGLE_SELECT_IMAGE', 'SINGLE_NUMBER', 'MULTIPLE_SELECT', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "QuestionState" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'DRAFT', 'INACTIVE', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ViewState" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "DraftStep" AS ENUM ('SelectBaseInfo', 'SelectServiceProviders', 'SelectAddress', 'SelectAnswers', 'SelectImages', 'SelectCategory', 'SelectSubCategory', 'SelectSubSubCategory', 'SelectService', 'SelectStartDate');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'BOOKED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('OPEN_TO_QUOTE', 'QUOTED');

-- CreateEnum
CREATE TYPE "QuotationTableStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PurchaseCredit', 'DiscountCredit', 'ServiceFee', 'Withdrawal', 'Refund', 'Promotion', 'AddMoney', 'SubscriptionDebts', 'SubscriptionPayment', 'ServicePayment', 'ServiceSalary');

-- CreateEnum
CREATE TYPE "TransactionState" AS ENUM ('Completed', 'Pending', 'Cancelled', 'Used');

-- CreateEnum
CREATE TYPE "BookingState" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'DISPUTE');

-- CreateEnum
CREATE TYPE "BookingWorkState" AS ENUM ('UPCOMING', 'RUNNING');

-- CreateEnum
CREATE TYPE "BookingRequestWorkState" AS ENUM ('UPCOMING', 'REQUEST_START', 'REQUEST_START_DENIED', 'RUNNING', 'REQUEST_FINISH', 'REQUEST_FINISH_DENIED', 'COMPLETED', 'DISPUTE');

-- CreateEnum
CREATE TYPE "FileDisputeStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EmailPhoneType" AS ENUM ('Email', 'Phone');

-- CreateEnum
CREATE TYPE "DiscountCommissionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'TIERED');

-- CreateEnum
CREATE TYPE "SubscriptionPlanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditPackageStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "LuandaCity" AS ENUM ('Outro', 'IcoloBengo', 'Luanda', 'Quicama', 'Cacuaco', 'Cazenga', 'Viana', 'Belas', 'KilambaKiaxi', 'Talatona');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('from16To24', 'from25To34', 'from35To44', 'from45To54', 'from55To64', 'from65OrMore');

-- CreateEnum
CREATE TYPE "SpendOnServices" AS ENUM ('from3000To9000', 'from10000To19000', 'from20000To39000', 'from40000OrMore');

-- CreateEnum
CREATE TYPE "WayFindServiceProvider" AS ENUM ('fromFriendsOrTrustedPeople', 'fromFamilyRecommendation', 'fromAnyoneRecommendation', 'fromInternetSearch', 'other');

-- CreateEnum
CREATE TYPE "WayToWork" AS ENUM ('haveWorkAndFreelancerOnFreeTime', 'workAsFreelancer', 'haveWorkAndFreelancerOnVocation');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationType" "OTPFor" NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "profile_url" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "state" "UserState" NOT NULL,
    "accountType" "AccountType" NOT NULL DEFAULT 'Client',
    "isEmailValidated" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneNumberValidated" BOOLEAN NOT NULL DEFAULT false,
    "defaultLanguage" "Language" NOT NULL DEFAULT 'PORTUGUESE',
    "referralCode" TEXT NOT NULL DEFAULT '',
    "referredBy" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "notificationToken" TEXT,
    "socketId" TEXT,
    "alreadyLogin" BOOLEAN NOT NULL DEFAULT false,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'email',
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'NotTell',
    "bornAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_providers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'NotTell',
    "bornAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "education" "EducationLevel" NOT NULL DEFAULT 'PrimaryEducation',
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "hasBudget" BOOLEAN NOT NULL DEFAULT false,
    "hasCertificateByBulir" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_service_provider_favorites" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_service_provider_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "hasSubSubCategory" BOOLEAN NOT NULL DEFAULT true,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_sub_categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "sub_category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT NOT NULL DEFAULT '',
    "sub_sub_category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "image6" TEXT,
    "service_provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,
    "service_id" TEXT,
    "rate" "Rate" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxAllowedUser" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "discount" DOUBLE PRECISION NOT NULL,
    "promotionFor" "AccountType" NOT NULL,
    "status" "PromotionStatus" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "promotionType" "PromotionType" NOT NULL DEFAULT 'Percentage',

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_promotions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "state" "UserPromotionState" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "bank_holder_name" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "readed" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "type" "NotificationType" NOT NULL DEFAULT 'RegisterSuccess',
    "parentId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "parentId" TEXT,
    "status" "PushNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "redirectTo" "PushNotificationRedirectTo" NOT NULL DEFAULT 'EMPTY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skiils" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skiils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_service_providers" (
    "id" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "skill_service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "state" "QuestionState" NOT NULL DEFAULT 'DRAFT',
    "type" "QuestionType" NOT NULL DEFAULT 'SIMPLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "serviceId" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "viewState" "ViewState" NOT NULL DEFAULT 'PUBLIC',
    "startDate" TIMESTAMP(3),
    "serviceId" TEXT,
    "addressId" TEXT,
    "clientId" TEXT NOT NULL,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "image6" TEXT,
    "categoryId" TEXT DEFAULT '',
    "subCategoryId" TEXT DEFAULT '',
    "subSubCategoryId" TEXT DEFAULT '',
    "state" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "draftStep" "DraftStep" NOT NULL DEFAULT 'SelectBaseInfo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_tasks" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "service_provider_id" TEXT NOT NULL,

    CONSTRAINT "private_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_jobs" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "image1" TEXT NOT NULL,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "image6" TEXT,
    "cancelReasonId" TEXT,
    "cancelDescription" TEXT,
    "viewState" "ViewState" NOT NULL DEFAULT 'PUBLIC',
    "state" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "quotationState" "QuotationStatus" NOT NULL DEFAULT 'OPEN_TO_QUOTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_delete_reason" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "task_delete_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_cancel_reason" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueEn" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "job_cancel_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_dispute_reason" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueEn" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "file_dispute_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_reject_reason" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "quotation_reject_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_job_views" (
    "id" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_provider_job_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "budget" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "rejectReasonId" TEXT,
    "rejectDescription" TEXT,
    "readByClient" BOOLEAN NOT NULL DEFAULT false,
    "status" "QuotationTableStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_tokens" (
    "id" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "notification_token" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "creditBalance" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "type" "TransactionType" NOT NULL,
    "status" "TransactionState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT,
    "walletId" TEXT NOT NULL,
    "promotionId" TEXT,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "workState" "BookingWorkState" NOT NULL,
    "requestWorkState" "BookingRequestWorkState" NOT NULL DEFAULT 'UPCOMING',
    "state" "BookingState" NOT NULL,
    "jobId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "totalTryingToStart" INTEGER NOT NULL DEFAULT 0,
    "totalTryingToFinish" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_disputes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "FileDisputeStatus" NOT NULL,
    "fileDisputeReasonId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "resolutionDate" TIMESTAMP(3),
    "resolutionComment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_and_ratings" (
    "id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_and_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_phone_updates" (
    "id" TEXT NOT NULL,
    "emailOrPhone" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EmailPhoneType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_phone_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sendById" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "readed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_conversations" (
    "id" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "active_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_commissions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "status" "DiscountCommissionStatus" NOT NULL,

    CONSTRAINT "discount_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "discountType" "DiscountType" NOT NULL DEFAULT 'TIERED',
    "creditsPerJob" INTEGER NOT NULL,
    "rollOverCredit" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "discountValue" DOUBLE PRECISION,
    "benefits" TEXT[],
    "status" "SubscriptionPlanStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCredit" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "vat" DOUBLE PRECISION NOT NULL,
    "status" "CreditPackageStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_inquires" (
    "id" TEXT NOT NULL,
    "emailOrNumber" TEXT NOT NULL,
    "city" "LuandaCity" NOT NULL,
    "whereLeave" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "preferredServices" TEXT[],
    "spendOnServices" "SpendOnServices" NOT NULL,
    "wayFindServiceProvider" "WayFindServiceProvider" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_inquires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_inquires" (
    "id" TEXT NOT NULL,
    "emailOrNumber" TEXT NOT NULL,
    "city" "LuandaCity" NOT NULL,
    "whereLeave" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "preferredServices" TEXT[],
    "wayToWork" "WayToWork" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_provider_inquires_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_userId_key" ON "clients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "service_providers_userId_key" ON "service_providers"("userId");

-- CreateIndex
CREATE INDEX "idx_sub_sub_category_sub_category_id" ON "sub_sub_categories"("sub_category_id");

-- CreateIndex
CREATE INDEX "idx_services_sub_sub_category_id" ON "services"("sub_sub_category_id");

-- CreateIndex
CREATE INDEX "idx_services_created_at" ON "services"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_name_key" ON "promotions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skiils_name_key" ON "skiils"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_service_providers_serviceProviderId_skillId_key" ON "skill_service_providers"("serviceProviderId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_tokens_userId_key" ON "notification_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "file_disputes_bookingId_key" ON "file_disputes"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_bookingId_key" ON "conversations"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "active_conversations_socketId_key" ON "active_conversations"("socketId");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_service_provider_favorites" ADD CONSTRAINT "client_service_provider_favorites_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_service_provider_favorites" ADD CONSTRAINT "client_service_provider_favorites_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_sub_categories" ADD CONSTRAINT "sub_sub_categories_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_sub_sub_category_id_fkey" FOREIGN KEY ("sub_sub_category_id") REFERENCES "sub_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_promotions" ADD CONSTRAINT "user_promotions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_promotions" ADD CONSTRAINT "user_promotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_service_providers" ADD CONSTRAINT "skill_service_providers_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_service_providers" ADD CONSTRAINT "skill_service_providers_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skiils"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_tasks" ADD CONSTRAINT "private_tasks_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_tasks" ADD CONSTRAINT "private_tasks_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_jobs" ADD CONSTRAINT "answer_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_jobs" ADD CONSTRAINT "answer_jobs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_job_views" ADD CONSTRAINT "service_provider_job_views_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_job_views" ADD CONSTRAINT "service_provider_job_views_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_tokens" ADD CONSTRAINT "notification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_disputes" ADD CONSTRAINT "file_disputes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_disputes" ADD CONSTRAINT "file_disputes_fileDisputeReasonId_fkey" FOREIGN KEY ("fileDisputeReasonId") REFERENCES "file_dispute_reason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_disputes" ADD CONSTRAINT "file_disputes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_and_ratings" ADD CONSTRAINT "review_and_ratings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_phone_updates" ADD CONSTRAINT "email_phone_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sendById_fkey" FOREIGN KEY ("sendById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_commissions" ADD CONSTRAINT "discount_commissions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
