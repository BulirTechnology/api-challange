import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type GenderProps = "Male" | "Female" | "NotTell";
export type AccountType = "Client" | "ServiceProvider" | "SuperAdmin";
export type Language = "PORTUGUESE" | "ENGLISH";
export type LanguageSlug = "en" | "pt";

export type UserState =
  | "Active"
  | "Inactive"
  | "SetupAccount"
  | "UnderReview"
  | "RequestDelete";
export type AuthProvider = "google" | "apple" | "email" | "facebook";

export interface UserProps {
  email: string;
  phoneNumber: string;
  password: string;
  state: UserState;
  defaultLanguage: Language;
  accountType: AccountType;
  isEmailValidated: boolean;
  profileUrl?: string;
  referralCode: string;
  referredBy: string | null;
  isPhoneNumberValidated: boolean;
  alreadyLogin: boolean;
  online: boolean;
  socketId: string;
  createdAt: Date;
  updatedAt?: Date | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  authProvider: AuthProvider;
  notificationToken: string;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiresAt: Date | null;
}

export class User extends Entity<UserProps> {
  get email() {
    return this.props.email;
  }
  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get referralCode() {
    return this.props.referralCode;
  }
  get online() {
    return this.props.online;
  }
  get referredBy() {
    return this.props.referredBy;
  }
  get profileUrl() {
    return this.props.profileUrl;
  }
  get password() {
    return this.props.password;
  }
  get alreadyLogin() {
    return this.props.alreadyLogin;
  }
  get defaultLanguage() {
    return this.props.defaultLanguage;
  }
  get socketId() {
    return this.props.socketId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.createdAt;
  }
  get state() {
    return this.props.state;
  }
  get accountType() {
    return this.props.accountType;
  }
  get isEmailValidated() {
    return this.props.isEmailValidated;
  }
  get isPhoneNumberValidated() {
    return this.props.isPhoneNumberValidated;
  }
  get refreshToken() {
    return this.props.refreshToken;
  }
  get isAuthenticated() {
    return this.props.isAuthenticated;
  }
  get authProvider() {
    return this.props.authProvider;
  }
  get notificationToken() {
    return this.props.notificationToken;
  }

  get resetPasswordToken() {
    return this.props.resetPasswordToken;
  }

  get resetPasswordTokenExpiresAt() {
    return this.props.resetPasswordTokenExpiresAt;
  }

  static create(
    props: Optional<UserProps, "state" | "createdAt">,
    id?: UniqueEntityID
  ) {
    const user = new User(
      {
        ...props,
        defaultLanguage: "PORTUGUESE",
        createdAt: props.createdAt ?? new Date(),
        state: props.state ? props.state : "Inactive",
      },
      id
    );

    return user;
  }
}
