import { OTPGenerator } from "@/domain/users/application/cryptography/otp-generator";
import { DateProvider } from "@/domain/users/application/date/date-provider";
import { MailSender } from "@/domain/users/application/mail/mail-sender";
import { SMSSender } from "@/domain/users/application/sms/sms-sender";

import { OtpRepository } from "@/domain/users/application/repositories/otp-repository";
import {
  Otp,
  ServiceProvider
} from "@/domain/users/enterprise";

export async function sendPhoneNumberOTP(
  currentSP: ServiceProvider,
  mailSender: MailSender, // refactor this route, to send when the client is created
  otpRepository: OtpRepository,
  dateProvider: DateProvider,
  otpGenerator: OTPGenerator,
  smsSender: SMSSender
) {
  await otpRepository.delete({
    userId: currentSP.userId.toString()
  });
  const expiresDate = dateProvider.addHours(3);
  const phoneNumberCode = await otpGenerator.generate();
  const phoneOTP = Otp.create({
    code: phoneNumberCode,
    expiresAt: expiresDate,
    isVerified: false,
    userId: currentSP.userId,
    verificationType: "PhoneNumber",
    createdAt: new Date(),
  });
  await otpRepository.create(phoneOTP);

  await smsSender.send({
    to: currentSP.phoneNumber,
    body: "O codigo OTP " + phoneOTP.code,
    email: currentSP.email
  });

  await mailSender.send({
    to: currentSP.email,
    body: phoneOTP.code,
    subject: "OTP to validate phone number",
    templateName: "account-phone-verification.hbs",
    variable: {
      username: currentSP.firstName + " " + currentSP.lastName,
      otpCode: phoneOTP.code,
    }
  });
}
