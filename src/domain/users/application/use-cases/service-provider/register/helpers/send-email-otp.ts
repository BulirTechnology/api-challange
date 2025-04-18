import { OTPGenerator } from "@/domain/users/application/cryptography/otp-generator";
import { DateProvider } from "@/domain/users/application/date/date-provider";
import { MailSender } from "@/domain/users/application/mail/mail-sender";

import { OtpRepository } from "@/domain/users/application/repositories";

import {
  Otp,
  ServiceProvider
} from "@/domain/users/enterprise";

export async function sendEmailOTP(
  currentSP: ServiceProvider,
  mailSender: MailSender, // refactor this route, to send when the client is created
  otpRepository: OtpRepository,
  dateProvider: DateProvider,
  otpGenerator: OTPGenerator,
) {
  console.log("dados do currentSP: ", currentSP);
  await otpRepository.delete({
    userId: currentSP.userId.toString()
  });
  const expiresDate = dateProvider.addHours(3);
  const emailCode = await otpGenerator.generate();
  const emailOTP = Otp.create({
    code: emailCode,
    expiresAt: expiresDate,
    isVerified: false,
    userId: currentSP.userId,
    verificationType: "Email",
    createdAt: new Date(),
  });
  await otpRepository.create(emailOTP);

  await mailSender.send({
    to: currentSP.email,
    body: emailOTP.code,
    subject: "OTP to validate email",
    templateName: "account-email-verification.hbs",
    variable: {
      username: currentSP.firstName + " " + currentSP.lastName,
      otpCode: emailOTP.code,
    }
  });
}