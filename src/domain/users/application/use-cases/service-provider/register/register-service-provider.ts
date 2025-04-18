import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";

import {
  ServiceProvider,
  User,
  Address,
  LanguageSlug,
} from "../../../../enterprise";
import {
  ServiceProvidersRepository,
  UsersRepository,
  AddressesRepository,
  DocumentRepository,
  OtpRepository,
  SpecializationsRepository,
} from "../../../repositories";

import { AccountAlreadyExistsError } from "../../errors/account-already-exists-error";
import { ResourceNotFoundError } from "@/core/errors";

import { MailSender } from "../../../mail/mail-sender";
import { SMSSender } from "../../../sms/sms-sender";
import { DateProvider } from "../../../date/date-provider";
import { OTPGenerator } from "../../../cryptography/otp-generator";
import { generateReferralCode } from "../../../helpers/generate-referral-code";
import { createServiceProviderWithRegister } from "./helpers/create-sp-with-register";

export const DEFAULT_PASSWORD = "!#$%&=*!#$%&=*!#$%&=*!#$%&=*!#$%&=*";

export interface RegisterServiceProviderUseCaseRequest {
  language: LanguageSlug;
  firstName: string;
  lastName: string;
  email: string;
  bornAt: Date;
  gender: "Male" | "Female" | "NotTell";
  phoneNumber: string;
  referredBy: string | null;
  address: {
    latitude: number;
    line1: string;
    line2: string;
    longitude: number;
    name: string;
  };
}

export type RegisterServiceProviderUseCaseResponse = Either<
  AccountAlreadyExistsError,
  {
    serviceProvider: ServiceProvider;
    nextStep:
      | "UploadDocument"
      | "SetPassword"
      | "AddService"
      | "ValidateEmail"
      | "ValidatedPhoneNumber";
  }
>;

@Injectable()
export class RegisterServiceProviderUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private addressesRepository: AddressesRepository,
    private documentsRepository: DocumentRepository,
    private mailSender: MailSender,
    private smsSender: SMSSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private specializationRepository: SpecializationsRepository
  ) {}

  async execute(
    props: RegisterServiceProviderUseCaseRequest
  ): Promise<RegisterServiceProviderUseCaseResponse> {
    const userWithSameEmail =
      await this.usersRepository.findByEmailAndAccountType({
        email: props.email,
        accountType: "ServiceProvider",
      });

    if (this.dateProvider.compareInYears(props.bornAt, new Date()) < 18) {
      return left(
        new ResourceNotFoundError("User should have at least 18 year old")
      );
    }

    if (
      userWithSameEmail &&
      userWithSameEmail.accountType === "ServiceProvider"
    ) {
      return await createServiceProviderWithRegister(
        props,
        userWithSameEmail,
        this.serviceProvidersRepository,
        this.documentsRepository,
        this.mailSender,
        this.otpRepository,
        this.dateProvider,
        this.otpGenerator,
        this.smsSender,
        this.addressesRepository,
        this.specializationRepository
      );
    }

    if (props.referredBy) {
      const existReferralCode =
        await this.usersRepository.existThisReferralCode(props.referredBy);

      if (!existReferralCode) {
        return left(new ResourceNotFoundError("Referral code not found"));
      }
    }

    const user = User.create({
      email: props.email,
      phoneNumber: props.phoneNumber,
      accountType: "ServiceProvider",
      isEmailValidated: false,
      isPhoneNumberValidated: false,
      defaultLanguage: "PORTUGUESE",
      password: DEFAULT_PASSWORD,
      state: "Inactive",
      notificationToken: "",
      isAuthenticated: false,
      refreshToken: "",
      authProvider: "email",
      referralCode: "",
      online: false,
      referredBy: props.referredBy,
      alreadyLogin: false,
      socketId: "",
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    });

    await this.usersRepository.create(user);

    const userCreated = await this.usersRepository.findByEmail(props.email);

    if (!userCreated) {
      return left(new ResourceNotFoundError("User not found"));
    }

    await this.usersRepository.updateReferralCode(
      userCreated.id.toString(),
      generateReferralCode(userCreated.id.toString())
    );

    const serviceProvider = ServiceProvider.create({
      bornAt: props.bornAt,
      firstName: props.firstName,
      gender: props.gender,
      lastName: props.lastName,
      phoneNumber: props.phoneNumber,
      state: "Inactive",
      email: user.email,
      isFavorite: false,
      userId: userCreated.id,
      description: "",
      education: "SecondaryEducation",
      profileUrl: "",
      hasBudget: false,
      hasCertificateByBulir: false,
      rating: 0,
    });

    const addressCreated = Address.create({
      isPrimary: true,
      latitude: props.address.latitude,
      line1: props.address.line1,
      line2: props.address.line2,
      longitude: props.address.longitude,
      name: props.address.name,
      userId: userCreated.id,
    });
    await this.addressesRepository.create(addressCreated);

    const response = await this.serviceProvidersRepository.create(
      serviceProvider
    );

    return right({
      serviceProvider: response,
      nextStep: "UploadDocument",
    });
  }
}
