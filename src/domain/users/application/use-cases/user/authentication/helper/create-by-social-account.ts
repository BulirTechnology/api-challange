import { left } from "@/core/either";

import { User, Client, Notification } from "@/domain/users/enterprise";

import { I18nContext, I18nService } from "nestjs-i18n";

import {
  UsersRepository,
  ClientsRepository,
  NotificationsRepository,
} from "@/domain/users/application/repositories";

import { generateReferralCode } from "@/domain/users/application/helpers/generate-referral-code";
import { SocialAuthenticateUseCaseRequest } from "../types";

import { ResourceNotFoundError } from "@/core/errors";

export async function createBySocialAccount(
  props: SocialAuthenticateUseCaseRequest,
  usersRepository: UsersRepository,
  i18n: I18nService,
  clientsRepository: ClientsRepository,
  notificationRepository: NotificationsRepository
): Promise<User> {
  const user = User.create({
    email: props.email,
    phoneNumber: "",
    password: "",
    accountType: "Client",
    isEmailValidated: true,
    defaultLanguage: "PORTUGUESE",
    isPhoneNumberValidated: false,
    isAuthenticated: false,
    refreshToken: "",
    authProvider: props.authProvider,
    notificationToken: "",
    referralCode: "",
    referredBy: "",
    alreadyLogin: false,
    online: false,
    profileUrl: props.photoUrl,
    socketId: "",
    resetPasswordToken: null,
    resetPasswordTokenExpiresAt: null,
  });

  await usersRepository.create(user);

  const userCreated = await usersRepository.findByEmail(props.email);

  if (!userCreated) {
    throw left(
      new ResourceNotFoundError(
        i18n.t("errors.user.not_found", { lang: I18nContext.current()?.lang })
      )
    );
  }

  await usersRepository.updateReferralCode(
    userCreated.id.toString(),
    generateReferralCode(userCreated.id.toString())
  );
  const client = Client.create({
    bornAt: new Date(),
    firstName: props.firstName,
    gender: "NotTell",
    lastName: props.lastName,
    phoneNumber: "",
    state: "Inactive",
    email: user.email,
    userId: userCreated.id,
  });

  await clientsRepository.create(client);

  const notification = Notification.create({
    description: `${props.firstName} ${props.lastName} ${i18n.t(
      "errors.notification.register_success_description",
      { lang: "pt" }
    )}`,
    descriptionEn: `${props.firstName} ${props.lastName} ${i18n.t(
      "errors.notification.register_success_description",
      { lang: "en" }
    )}`,
    readed: false,
    title: i18n.t("errors.notification.register_success_title", { lang: "pt" }),
    titleEn: i18n.t("errors.notification.register_success_title", {
      lang: "en",
    }),
    userId: userCreated.id,
    parentId: null,
    type: "RegisterSuccess",
  });
  await notificationRepository.create(notification);

  return userCreated;
}
