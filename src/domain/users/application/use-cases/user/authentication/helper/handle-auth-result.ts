import {
  Address,
  AccountType,
  GenderProps,
  User,
} from "@/domain/users/enterprise";

import { AuthenticateUserUseCaseResponse } from "../types";
import { right } from "@/core/either";

export function handleAuthResult({
  accessToken,
  refreshToken,
  accountType,
  nextStep,
  user,
  address,
  description,
  education,
  bornAt,
  firstName,
  gender,
  lastName,
  profileId,
  notificationToken,
}: {
  accessToken: string;
  refreshToken: string;
  accountType: AccountType;
  nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined;
  user: User;
  address: Address;
  description: string;
  education: string;
  bornAt: Date | null;
  firstName: string;
  gender: GenderProps;
  lastName: string;
  profileId: string;
  notificationToken: string;
}): AuthenticateUserUseCaseResponse {
  return right({
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      profileId,
      firstName,
      lastName,
      email: user.email,
      referralCode: user.referralCode,
      phoneNumber: user.phoneNumber,
      notificationToken,
      bornAt,
      gender,
      description,
      education,
      nextStep,
      defaultLanguage: user.defaultLanguage,
      isFirstTime: !user.alreadyLogin,
      address: {
        id: address.id,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        longitude: address.longitude,
        latitude: address.latitude,
      },
      state: user.state,
      profileUrl: user.profileUrl + "",
      isEmailValidated: user.isEmailValidated,
      isPhoneNumberValidated: user.isPhoneNumberValidated,
      accountType,
      authProvider: user.authProvider,
    },
  });
}
