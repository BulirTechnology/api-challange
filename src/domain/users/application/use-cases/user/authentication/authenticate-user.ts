import { left } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository,
  SpecializationsRepository,
  PortfoliosRepository,
  PushNotificationRepository,
} from "@/domain/users/application/repositories";

import { Encrypter, HashComparator } from "../../../cryptography";

import { WrongCredentialsError } from "../../errors/wrong-credentials-error";

import { handleUserRegistrationNotification } from "./helper/handle-auth-notification";
import { handleAuthResult } from "./helper/handle-auth-result";
import { handleGetProfileDetails } from "./helper/handle-get-profile-details";
import { handleCanAuthentication } from "./helper/handle-can-authentication";

import {
  AuthenticateUserUseCaseRequest,
  AuthenticateUserUseCaseResponse,
} from "./types";

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparator: HashComparator,
    private clientRepository: ClientsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private encrypter: Encrypter,
    private specializationsRepository: SpecializationsRepository,
    private portfoliosRepository: PortfoliosRepository,
    private readonly i18n: I18nService,
    private pushNotificationRepository: PushNotificationRepository
  ) {}

  async execute({
    email,
    password,
    accountType,
    pushNotificationToken,
    deviceType,
    rememberMe,
    validateWithPassword,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({
      email,
      accountType,
    });

    if (!user) {
      return left(new WrongCredentialsError());
    }

    const canAuthenticate = await handleCanAuthentication({
      hashComparator: this.hashComparator,
      password,
      user,
      validateWithPassword,
    });

    if (canAuthenticate instanceof Error) {
      return left(canAuthenticate);
    }

    const { accessToken, refreshToken } = await this.encrypter.encrypt(
      { sub: user.id.toString(), role: accountType },
      rememberMe
    );

    const {
      bornAt,
      description,
      education,
      firstName,
      gender,
      lastName,
      nextStep,
      profileId,
    } = await handleGetProfileDetails({
      accountType,
      clientRepository: this.clientRepository,
      email,
      portfoliosRepository: this.portfoliosRepository,
      serviceProviderRepository: this.serviceProviderRepository,
      specializationsRepository: this.specializationsRepository,
      user,
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
      accountType,
      nextStep,
      refreshToken,
      user,
      address,
      bornAt,
      description,
      education,
      firstName,
      gender,
      lastName,
      profileId,
      notificationToken: user.notificationToken,
    });
  }
}
