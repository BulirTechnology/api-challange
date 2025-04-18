import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { OTPGenerator } from "../../../cryptography/otp-generator";
import { DateProvider } from "../../../date/date-provider";
import { MailSender } from "../../../mail/mail-sender";

import {
  OtpRepository,
  UsersRepository,
  EmailPhoneUpdateRepository
} from "../../../repositories";

import {
  Otp,
  EmailPhoneUpdate
} from "@/domain/users/enterprise";

interface AuthRequestUpdateEmailUseCaseRequest {
  language: "en" | "pt"
  userId: string
  email: string
}

type AuthRequestUpdateEmailUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AuthRequestUpdateEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private mailSender: MailSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private emailPhoneUpdateRepository: EmailPhoneUpdateRepository
  ) { }

  async execute({
    userId,
    email
  }: AuthRequestUpdateEmailUseCaseRequest): Promise<AuthRequestUpdateEmailUseCaseResponse> {
    const existAccount = await this.usersRepository.findById(userId);

    if (!existAccount) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const code = await this.otpGenerator.generate();
    const expiresDate = this.dateProvider.addHours(3);

    const emailOTP = Otp.create({
      code,
      expiresAt: expiresDate,
      isVerified: false,
      userId: existAccount.id,
      verificationType: "Email",
      createdAt: new Date(),
    });

    const emailPhoneUpdate = EmailPhoneUpdate.create({
      emailOrPhone: email,
      userId: new UniqueEntityID(userId),
      type: "Email"
    });

    await this.otpRepository.create(emailOTP);

    await this.mailSender.send({
      to: email,
      body: code,
      subject: "Update email",
      variable: {
        username: "",
        otpCode: emailOTP.code,
      },
      templateName: "account-email-verification.hbs"
    });

    await this.emailPhoneUpdateRepository.create(emailPhoneUpdate);

    return right({
      message: "OTP sended",
    });
  }
}
