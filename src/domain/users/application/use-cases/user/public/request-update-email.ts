import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { OTPGenerator } from "../../../cryptography";
import { DateProvider } from "../../../date/date-provider";
import { MailSender } from "../../../mail/mail-sender";

import {
  OtpRepository,
  UsersRepository
} from "../../../repositories";
import { } from "../../../repositories/user-repository";
import { Otp } from "@/domain/users/enterprise";

import { AccountAlreadyExistsError } from "../../errors";
interface RequestUpdateEmailUseCaseRequest {
  language: "en" | "pt"
  userId: string
  email: string
}

type RequestUpdateEmailUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class RequestUpdateEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private mailSender: MailSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator
  ) { }

  async execute({
    userId,
    email
  }: RequestUpdateEmailUseCaseRequest): Promise<RequestUpdateEmailUseCaseResponse> {
    const existAccount = await this.usersRepository.findById(userId);

    if (!existAccount) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const existAccountWithEmail = await this.usersRepository.findByEmail(email);

    if (existAccountWithEmail && existAccountWithEmail.id.toString() !== userId) {
      return left(new AccountAlreadyExistsError(email, "email"));
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

    await this.otpRepository.create(emailOTP);

    await this.mailSender.send({
      to: existAccount.email,
      body: emailOTP.code, // submit the client email otp
      subject: "My subject",
      variable: {},
      templateName: "account-email-verification.hbs"
    });

    return right({
      message: "OTP sended",
    });
  }
}
