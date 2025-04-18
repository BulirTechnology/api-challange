import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Otp } from "@/domain/users/enterprise";

import { OTPGenerator } from "../../../cryptography";
import { DateProvider } from "../../../date/date-provider";
import { SMSSender } from "../../../sms/sms-sender";
import { MailSender } from "../../../mail/mail-sender";

import {
  UsersRepository,
  OtpRepository
} from "../../../repositories";

interface RequestUpdatePhoneNumberUseCaseRequest {
  language: "en" | "pt"
  userId: string
  phoneNumber: string
}

type RequestUpdatePhoneNumberUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class RequestUpdatePhoneNumberUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private mailSender: MailSender,
    private smsSender: SMSSender, // refactor this route, to send when the client is created
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator
  ) { }

  async execute({
    userId
  }: RequestUpdatePhoneNumberUseCaseRequest): Promise<RequestUpdatePhoneNumberUseCaseResponse> {
    const existAccount = await this.usersRepository.findById(userId);

    if (!existAccount) {
      return left(new ResourceNotFoundError("User not found"));
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

    await this.otpRepository.create(phoneOTP);

    await this.smsSender.send({
      to: existAccount.phoneNumber,
      body: "O codigo OTP " + phoneOTP.code,
      email: existAccount.email
    });

    await this.mailSender.send({
      to: existAccount.email,
      body: phoneOTP.code, // submit the client email otp
      subject: "My subject",
      variable: {},
      templateName: "account-email-verification.hbs"
    });

    return right({
      message: "OTP sended",
    });
  }
}
