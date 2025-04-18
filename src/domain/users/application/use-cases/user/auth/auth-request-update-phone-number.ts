import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  InvalidResourceError,
  ResourceNotFoundError
} from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Otp } from "@/domain/users/enterprise";
import { EmailPhoneUpdate } from "@/domain/users/enterprise/email-phone-update";

import { OTPGenerator } from "../../../cryptography/otp-generator";
import { DateProvider } from "../../../date/date-provider";
import { SMSSender } from "../../../sms/sms-sender";

import {
  EmailPhoneUpdateRepository,
  UsersRepository,
  OtpRepository
} from "../../../repositories";

import { AccountAlreadyExistsError } from "../../errors";


interface AuthRequestUpdatePhoneNumberUseCaseRequest {
  language: "en" | "pt"
  userId: string
  phoneNumber: string
}

type AuthRequestUpdatePhoneNumberUseCaseResponse = Either<
  AccountAlreadyExistsError,
  {
    message: string
  }
>

@Injectable()
export class AuthRequestUpdatePhoneNumberUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private smsSender: SMSSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private emailPhoneUpdateRepository: EmailPhoneUpdateRepository
  ) { }

  async execute({
    userId,
    phoneNumber
  }: AuthRequestUpdatePhoneNumberUseCaseRequest): Promise<AuthRequestUpdatePhoneNumberUseCaseResponse> {
    const existAccount = await this.usersRepository.findById(userId);

    if (!existAccount) {
      return left(new ResourceNotFoundError("User not found"));
    }

    if (existAccount.phoneNumber === phoneNumber && existAccount.isPhoneNumberValidated) {
      return left(new InvalidResourceError("You need to inform new phone number"));
    }

    const code = await this.otpGenerator.generate();
    const expiresDate = this.dateProvider.addHours(3);

    const phoneOTP = Otp.create({
      code,
      expiresAt: expiresDate,
      isVerified: false,
      userId: existAccount.id,
      verificationType: "PhoneNumber",
      createdAt: new Date(),
    });

    const phoneNumberUpdate = EmailPhoneUpdate.create({
      emailOrPhone: phoneNumber,
      userId: new UniqueEntityID(userId),
      type: "Phone"
    });

    await this.otpRepository.create(phoneOTP);

    await this.smsSender.send({
      to: existAccount.phoneNumber,
      body: "O codigo OTP " + phoneOTP.code,
      email: existAccount.email
    });

    await this.emailPhoneUpdateRepository.create(phoneNumberUpdate);

    return right({
      message: "OTP sended",
    });
  }
}
