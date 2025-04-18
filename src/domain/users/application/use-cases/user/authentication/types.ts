import { Either } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  AccountType,
  AuthProvider,
  GenderProps,
  Language,
  UserState,
} from "@/domain/users/enterprise";

import { WrongCredentialsError } from "../../errors/wrong-credentials-error";

export interface AuthenticateUserUseCaseRequest {
  language: "en" | "pt";
  email: string;
  password: string;
  accountType: "Client" | "ServiceProvider";
  pushNotificationToken?: string;
  deviceType?: "android" | "ios" | "web";
  rememberMe: boolean;
  validateWithPassword: boolean;
}

export interface SocialAuthenticateUseCaseRequest {
  language: "en" | "pt";
  email: string;
  authProvider: "google" | "apple" | "facebook";
  pushNotificationToken?: string;
  deviceType?: "android" | "ios" | "web";
  rememberMe: boolean;
  lastName: string;
  firstName: string;
  idToken: string;
  photoUrl: string;
}

export type AuthUser = {
  id: UniqueEntityID;
  profileId?: string;
  firstName?: string;
  notificationToken?: string;
  lastName?: string;
  email: string;
  referralCode?: string;
  phoneNumber?: string;
  bornAt?: Date | null;
  nextStep?: "PersonalInfo" | "Services" | "Portfolio";
  gender?: GenderProps;
  description?: string;
  education?: string;
  defaultLanguage: Language;
  isFirstTime?: boolean;
  address?: {
    id: UniqueEntityID;
    name: string;
    line1: string;
    line2: string;
    longitude: number;
    latitude: number;
  };
  state: UserState;
  profileUrl?: string;
  isEmailValidated?: boolean;
  isPhoneNumberValidated?: boolean;
  accountType: "Client" | "ServiceProvider" | "SuperAdmin";
  authProvider: AuthProvider;
};

export type AuthenticateUserUseCaseResponse = Either<
  WrongCredentialsError,
  {
    user: AuthUser;
    token: string;
    refreshToken: string;
  }
>;

export type SocialAuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  {
    user: AuthUser;
    token: string;
    refreshToken: string;
  }
>;

export interface SessionBackofficeUseCaseRequest {
  language: "en" | "pt";
  email: string;
  password: string;
  accountType: "SuperAdmin";
  rememberMe: boolean;
  validateWithPassword: boolean;
}

export type SessionBackofficeUseCaseResponse = Either<
  WrongCredentialsError,
  {
    user: {
      id: UniqueEntityID;
      email: string;
      state: UserState;
      defaultLanguage: Language;
      accountType: AccountType;
      authProvider: AuthProvider;
    };
    token: string;
    refreshToken: string;
  }
>;
