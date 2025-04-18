import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Otp } from "@/domain/users/enterprise";

import { UsersRepository, OtpRepository } from "../../repositories";

import { MailSender } from "../../mail/mail-sender";
import { DateProvider } from "../../date/date-provider";
import { OTPGenerator } from "../../cryptography";
import { SendRequestToRecoverBackofficePasswordUseCase } from "./send-request-to-recover-backoffice-password";

interface SendRequestToRecoverPasswordUseCaseRequest {
  language: "en" | "pt";
  email: string;
  accountType: "Client" | "ServiceProvider" | "SuperAdmin";
}
type SendRequestToRecoverPasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string;
  }
>;

@Injectable()
export class SendRequestToRecoverPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private mailSender: MailSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private sendRequestToRecoverBackofficePassword: SendRequestToRecoverBackofficePasswordUseCase
  ) {}

  async execute({
    email,
    accountType,
  }: SendRequestToRecoverPasswordUseCaseRequest): Promise<SendRequestToRecoverPasswordUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({
      email,
      accountType,
    });

    if (!user || user.authProvider !== "email") {
      return left(new ResourceNotFoundError("User not found"));
    }

    if (user.accountType === "SuperAdmin") {
      return this.sendRequestToRecoverBackofficePassword.execute({
        email,
        accountType: "SuperAdmin",
      });
    } else {
      const emailCode = await this.otpGenerator.generate();
      const expiresDate = this.dateProvider.addHours(3);

      const emailOTP = Otp.create({
        code: emailCode,
        expiresAt: expiresDate,
        isVerified: false,
        userId: user.id,
        verificationType: "Password",
        createdAt: new Date(),
      });

      await this.otpRepository.create(emailOTP);

      await this.mailSender.send({
        to: user.email,
        body: emailOTP.code,
        subject: "OTP to recover password",
        templateName: "account-recover-password-verification.hbs",
        variable: {
          username: "",
          otpCode: emailOTP.code,
        },
      });
      console.log(emailOTP);
      return right({
        message: "Email send successfully",
      });
    }
  }
}
