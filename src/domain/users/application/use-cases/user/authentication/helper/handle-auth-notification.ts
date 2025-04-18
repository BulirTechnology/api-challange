import {
  FcmTokenRepository,
  PushNotificationRepository,
  UsersRepository,
} from "@/domain/users/application/repositories";

import { PushNotification, User } from "@/domain/users/enterprise";

import { I18nService } from "nestjs-i18n";

export async function handleUserRegistrationNotification(params: {
  user: User;
  firstName: string;
  lastName: string;
  pushNotificationToken: string;
  deviceType?: "android" | "ios" | "web";
  fcmTokenRepository: FcmTokenRepository;
  usersRepository: UsersRepository;
  i18n: I18nService;
  pushNotificationRepository: PushNotificationRepository;
}): Promise<void> {
  if (!params.user.alreadyLogin && params.user.accountType === "Client") {
    const pushNotification = PushNotification.create({
      description: `${params.firstName} ${params.lastName} ${params.i18n.t(
        "errors.notification.register_success_description",
        { lang: "pt" }
      )}`,
      descriptionEn: `${params.firstName} ${params.lastName} ${params.i18n.t(
        "errors.notification.register_success_description",
        { lang: "en" }
      )}`,
      parentId: null,
      status: "PENDING",
      title: params.i18n.t("errors.notification.register_success_title", {
        lang: "pt",
      }),
      titleEn: params.i18n.t("errors.notification.register_success_title", {
        lang: "en",
      }),
      userId: params.user.id,
      redirectTo: "DASHBOARD",
    });

    await params.pushNotificationRepository.create(pushNotification);
    await params.usersRepository.setAlreadyLogin(params.user.id.toString());
  }
  if (
    !params.user.alreadyLogin &&
    params.user.accountType === "ServiceProvider" &&
    params.user.state === "Active"
  ) {
    await params.usersRepository.setAlreadyLogin(params.user.id.toString());
  }
}
