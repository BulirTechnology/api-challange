import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { UsersRepository, ClientsRepository } from "../../repositories";
import { Encrypter } from "../../cryptography";
import { WrongCredentialsError } from "../errors";

import { UserAlreadyAuthenticatedError } from "../errors";
import { User, Client } from "@/domain/users/enterprise";

import { generateReferralCode } from "../../helpers/generate-referral-code";

interface SocialAuthenticationUseCaseRequest {
  language: "en" | "pt";
  firstName: string;
  email: string;
  profileUrl: string;
  lastName: string;
  authProvider: "google" | "apple" | "email";
}

export type AuthUser = {
  id: UniqueEntityID;
  profileId: string;
  firstName: string;
  nextStep: string;
  lastName: string;
  referralCode: string;
  email: string;
  phoneNumber: string;
  bornAt: Date;
  gender: "Male" | "Female";
  description?: string;
  education?: string;
  defaultLanguage: string;
  address: {
    id: UniqueEntityID;
    name: string;
    line1: string;
    line2: string;
    longitude: number;
    latitude: number;
  };
  state: string;
  profileUrl: string;
  isEmailValidated: boolean;
  isPhoneNumberValidated: boolean;
  accountType: "Client" | "ServiceProvider";
};

type SocialAuthenticationUseCaseResponse = Either<
  WrongCredentialsError,
  {
    user: AuthUser;
    token: string;
    refreshToken: string;
  }
>;

@Injectable()
export class SocialAuthenticationUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private encrypter: Encrypter
  ) {}

  private async generate(
    props: SocialAuthenticationUseCaseRequest
  ): Promise<SocialAuthenticationUseCaseResponse> {
    const user = User.create({
      accountType: "Client",
      defaultLanguage: "PORTUGUESE",
      email: props.email,
      isAuthenticated: false,
      isEmailValidated: true,
      password: "not_defined",
      phoneNumber: "",
      isPhoneNumberValidated: false,
      notificationToken: "",
      refreshToken: null,
      profileUrl: props.profileUrl,
      state: "Active",
      authProvider: props.authProvider,
      referralCode: "",
      referredBy: "",
      online: false,
      alreadyLogin: false,
      socketId: "",
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    });

    const userCreated = await this.usersRepository.create(user);

    await this.usersRepository.updateReferralCode(
      userCreated.id.toString(),
      generateReferralCode(userCreated.id.toString())
    );
    const client = Client.create({
      bornAt: new Date(),
      email: props.email,
      firstName: props.firstName,
      gender: "Male",
      lastName: props.lastName,
      phoneNumber: "",
      state: "Active",
      userId: userCreated.id,
      isEmailValidated: true,
      isPhoneNumberValidated: false,
    });

    this.clientRepository.create(client);

    const { accessToken, refreshToken } = await this.encrypter.encrypt(
      { sub: user.id.toString(), role: user.accountType },
      false
    );

    const address = await this.usersRepository.findMainAddress(
      user.id.toString()
    );
    await this.usersRepository.updateRefreshToken({
      userId: user.id.toString(),
      isAuthenticated: true,
      refreshToken,
    });

    return right({
      token: accessToken,
      refreshToken,
      user: {
        accountType: "Client",
        nextStep: "",
        referralCode: user.referralCode,
        address: {
          id: address.id,
          name: address.name,
          line1: address.line1,
          line2: address.line2,
          longitude: address.longitude,
          latitude: address.latitude,
        },
        bornAt: new Date(`${client?.bornAt}`),
        defaultLanguage: user.defaultLanguage,
        email: user.email,
        firstName: `${client?.firstName}`,
        gender: "Male",
        id: user.id,
        isEmailValidated: user.isEmailValidated,
        isPhoneNumberValidated: user.isPhoneNumberValidated,
        lastName: `${client?.lastName}`,
        phoneNumber: user.phoneNumber,
        profileId: "",
        profileUrl: user.profileUrl + "",
        state: user.state,
      },
    });
  }

  async execute(
    params: SocialAuthenticationUseCaseRequest
  ): Promise<SocialAuthenticationUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({
      email: params.email,
      accountType: "Client",
    });

    if (!user) {
      return this.generate(params);
    }

    if (user.authProvider !== params.authProvider) {
      return left(new WrongCredentialsError());
    }

    if (user.isAuthenticated) {
      return left(new UserAlreadyAuthenticatedError());
    }

    const client = await this.clientRepository.findByEmail(params.email);

    const { accessToken, refreshToken } = await this.encrypter.encrypt(
      { sub: user.id.toString(), role: user.accountType },
      false
    );

    const address = await this.usersRepository.findMainAddress(
      user.id.toString()
    );
    await this.usersRepository.updateRefreshToken({
      userId: user.id.toString(),
      isAuthenticated: true,
      refreshToken,
    });

    return right({
      token: accessToken,
      refreshToken,
      user: {
        accountType: "Client",
        referralCode: user.referralCode,
        nextStep: "",
        address: {
          id: address.id,
          name: address.name,
          line1: address.line1,
          line2: address.line2,
          longitude: address.longitude,
          latitude: address.latitude,
        },
        bornAt: new Date(`${client?.bornAt}`),
        defaultLanguage: user.defaultLanguage,
        email: user.email,
        firstName: `${client?.firstName}`,
        gender: "Male",
        id: user.id,
        isEmailValidated: user.isEmailValidated,
        isPhoneNumberValidated: user.isPhoneNumberValidated,
        lastName: `${client?.lastName}`,
        phoneNumber: user.phoneNumber,
        profileId: "",
        profileUrl: user.profileUrl + "",
        state: user.state,
      },
    });
  }
}
