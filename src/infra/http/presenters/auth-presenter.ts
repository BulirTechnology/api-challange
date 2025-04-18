import { AuthUser } from "@/domain/users/application/use-cases/user/authentication/types";

export class AuthPresenter {
  static toHTTP(user: AuthUser, storageUrl: string) {
    let profileUrl = "";
    if (user.profileUrl) {
      if (user.authProvider === "google") {
        profileUrl = user.profileUrl;
      } else profileUrl = storageUrl + user.profileUrl;
    }

    if (user.accountType === "SuperAdmin") {
      return {
        id: user.id.toString(),
        email: user.email,
        default_language: user.defaultLanguage,
        account_type: user.accountType,
        state: user.state,
        auth_provider: user.authProvider,
      };
    }

    const result = {
      id: user.id.toString(),
      profile_id: user.profileId,
      is_first_time: user.isFirstTime,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      description: user.description,
      education: user.education,
      phone_number: user.phoneNumber,
      referral_code: user.referralCode,
      notificationToken: user.notificationToken,
      born_at: user.bornAt,
      gender: user.gender,
      default_language: user.defaultLanguage,
      auth_provider: user.authProvider,
      address: {
        id: user.address?.id.toString(),
        name: user.address?.name,
        line1: user.address?.line1,
        line2: user.address?.line2,
        longitude: user.address?.longitude,
        latitude: user.address?.latitude,
      },
      state: user.state,
      next_step: user.nextStep,
      profile_url: profileUrl,
      is_email_validated: user.isEmailValidated,
      is_phone_number_validated: user.isPhoneNumberValidated,
      account_type: user.accountType,
    };

    if (user.accountType !== "ServiceProvider") {
      delete result.description;
      delete result.education;
      delete result.next_step;
    }

    if (
      user.accountType === "ServiceProvider" &&
      user.state !== "SetupAccount"
    ) {
      delete result.next_step;
    }

    return result;
  }
}
