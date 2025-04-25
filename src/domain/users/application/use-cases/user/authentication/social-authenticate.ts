import { left } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

import {
  UsersRepository,
  ClientsRepository,
  PushNotificationRepository,
  NotificationsRepository,
} from "../../../repositories";

import { Encrypter } from "../../../cryptography";
import { AccountAlreadyExistsError } from "../../errors/account-already-exists-error";

import { createBySocialAccount } from "./helper/create-by-social-account";
import { handleAuthResult } from "./helper/handle-auth-result";
import { handleGetProfileDetails } from "./helper/handle-get-profile-details";

import {
  SocialAuthenticateUseCaseRequest,
  SocialAuthenticateUseCaseResponse,
} from "./types";

@Injectable()
export class SocialAuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private encrypter: Encrypter,
    private readonly i18n: I18nService,
    private pushNotificationRepository: PushNotificationRepository,
    private notificationsRepository: NotificationsRepository
  ) {}

  async execute(
    props: SocialAuthenticateUseCaseRequest
  ): Promise<SocialAuthenticateUseCaseResponse> {
    let user = await this.usersRepository.findByEmailAndAccountType({
      email: props.email,
      accountType: "Client",
    });

    if (user && user.authProvider !== props.authProvider) {
      return left(new AccountAlreadyExistsError(props.email, "email"));
    }

    if (!user) {
      user = await createBySocialAccount(
        props,
        this.usersRepository,
        this.i18n,
        this.clientRepository,
        this.notificationsRepository
      );
    }
    /*  if (user.isAuthenticated) {
      return left(new UserAlreadyAuthenticatedError());
    } */

    const { accessToken, refreshToken } = await this.encrypter.encrypt(
      { sub: user.id.toString(), role: user.accountType },
      props.rememberMe
    );

    const { bornAt, firstName, gender, lastName, profileId } =
      await handleGetProfileDetails({
        accountType: "Client",
        email: user.email,
        user,
        clientRepository: this.clientRepository,
      });

    const address = await this.usersRepository.findMainAddress(
      user.id.toString()
    );
    await this.usersRepository.updateRefreshToken({
      userId: user.id.toString(),
      isAuthenticated: true,
      refreshToken,
    });

    return handleAuthResult({
      accessToken,
      accountType: "Client",
      nextStep: undefined,
      refreshToken,
      user,
      address,
      bornAt,
      description: "",
      education: "",
      firstName,
      gender,
      lastName,
      profileId,
      notificationToken: user.notificationToken,
    });
  }
}
