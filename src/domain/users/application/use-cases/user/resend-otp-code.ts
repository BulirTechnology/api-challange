import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Otp } from "@/domain/users/enterprise";

import { SMSSender } from "../../sms/sms-sender";
import { MailSender } from "../../mail/mail-sender";
import { OTPGenerator } from "../../cryptography";
import { DateProvider } from "../../date/date-provider";

import {
  OtpRepository,
  UsersRepository
} from "../../repositories";

interface ResendOtpCodeUseCaseRequest {
  language: "en" | "pt"
  email: string,
  accountType: "Client" | "ServiceProvider"
  verificationFor: "Email" | "PhoneNumber"
}

type ResendOtpCodeUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class ResendOtpCodeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private mailSender: MailSender,
    private smsSender: SMSSender,
  ) { }

  async execute({
    email,
    verificationFor,
    accountType
  }: ResendOtpCodeUseCaseRequest): Promise<ResendOtpCodeUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({ email, accountType });

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const code = await this.otpGenerator.generate();
    const expiresDate = this.dateProvider.addHours(3);

    if (verificationFor === "Email") {
      const emailOTP = Otp.create({
        code,
        expiresAt: expiresDate,
        isVerified: false,
        userId: user.id,
        verificationType: "Email",
        createdAt: new Date(),
      });

      /*       const pendingOtp = await this.otpRepository.findUserPendingOtp({
              userId: user.id.toString()
            })
      
            if (pendingOtp)  */

      await this.otpRepository.create(emailOTP);

      this.mailSender.send({
        to: user.email,
        body: emailOTP.code,
        subject: "OTP to validate email",
        templateName: "account-resend-otp-code-email-validation.hbs",
        variable: {
          username: "",
          otpCode: emailOTP.code,
        }
      });
    } else {
      const phoneNumberOTP = Otp.create({
        code,
        expiresAt: expiresDate,
        isVerified: false,
        userId: user.id,
        verificationType: "PhoneNumber",
        createdAt: new Date(),
      });

      await this.otpRepository.create(phoneNumberOTP);

      await this.smsSender.send({
        to: user.phoneNumber,
        body: phoneNumberOTP.code,
        email: user.email
      });
    }

    return right(null);
  }
}
