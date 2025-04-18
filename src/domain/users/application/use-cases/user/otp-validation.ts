import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  OtpRepository,
  UsersRepository,
  NotificationsRepository,
  ClientsRepository
} from "../../repositories";

import { WalletRepository } from "@/domain/payment/application/repositories";

import { DateProvider } from "../../date/date-provider";
import { OTPGenerator } from "../../cryptography/otp-generator";
import { SMSSender } from "../../sms/sms-sender";
import { MailSender } from "../../mail/mail-sender";

import { InvalidOTPCodeError } from "../errors";

import {
  Otp,
  User,
  Notification
} from "../../../enterprise";
import { Wallet } from "@/domain/payment/enterprise";

interface OtpValidationUseCaseRequest {
  language: "en" | "pt"
  code: string,
  email: string,
  accountType: "Client" | "ServiceProvider"
  verificationFor: "Email" | "PhoneNumber" | "Password"
}

type OtpValidationUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class OtpValidationUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private smsSender: SMSSender,
    private walletRepository: WalletRepository,
    private notificationRepository: NotificationsRepository,
    private mailSender: MailSender,
    private clientRepository: ClientsRepository
  ) { }

  private async submitPhoneNumberOtp(user: User) {
    const phoneCode = await this.otpGenerator.generate();
    const expiresDate = this.dateProvider.addHours(3);

    const phoneNumberOTP = Otp.create({
      code: phoneCode,
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

  async execute({
    email,
    code,
    verificationFor,
    accountType,
    language
  }: OtpValidationUseCaseRequest): Promise<OtpValidationUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({ email, accountType });

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const otpCode = await this.otpRepository.findByUserIdAndCode({
      userId: user.id.toString(),
      code
    });

    if (!otpCode) {
      return left(new ResourceNotFoundError("OPT code not found"));
    }

    const differentInHours = this.dateProvider.compareInHours(new Date(), otpCode.expiresAt);
    if (differentInHours < 0) {
      return left(new InvalidOTPCodeError());
    }

    if (verificationFor === "Email" && otpCode.verificationType !== "Email") {
      return left(new InvalidOTPCodeError());
    }
    if (verificationFor === "PhoneNumber" && otpCode.verificationType !== "PhoneNumber") {
      return left(new InvalidOTPCodeError());
    }
    if (verificationFor === "Password" && otpCode.verificationType !== "Password") {
      return left(new InvalidOTPCodeError());
    }

    if (otpCode.verificationType === "Email") {
      if (!user.isPhoneNumberValidated) this.submitPhoneNumberOtp(user);
      await this.usersRepository.validatedEmail(otpCode.userId.toString());
      await this.otpRepository.validate(otpCode.id.toString());
    } else if (otpCode.verificationType === "PhoneNumber") {
      await this.usersRepository.validatePhoneNumber(otpCode.userId.toString());
      await this.otpRepository.validate(otpCode.id.toString());

      if (user.accountType === "ServiceProvider") {
        await this.usersRepository.updateState(user.id.toString(), "UnderReview");
      } else {
        await this.usersRepository.updateState(user.id.toString(), "Active");
      }

      const wallet = await this.walletRepository.findById(user.id.toString());

      if (!wallet) {
        const createdWallet = Wallet.create({
          balance: 0,
          creditBalance: 0,
          userId: user.id,
        });

        await this.walletRepository.create(createdWallet);
      }

      if (user.accountType !== "Client") return right(null);

      const notificationWelcome = await this.notificationRepository.findByUserIdAndType({
        userId: user.id.toString(),
        type: "RegisterSuccess",
        language
      });

      if (!notificationWelcome) {
        const notification = Notification.create({
          description: "Estamos felizes em tê-lo(a) aqui! Encontre profissionais excepcionais prontos para transformar suas ideias em realidade.",
          descriptionEn: "We're glad to have you here! Discover exceptional professionals ready to bring your ideas to life.",
          parentId: null,
          readed: false,
          title: "Conta criada com sucesso!",
          titleEn: "Register Sucessfully!",
          type: "RegisterSuccess",
          userId: user.id,
        });

        await this.notificationRepository.create(notification);
      }

      const client = await this.clientRepository.findByEmail(user.email);

      this.mailSender.send({
        to: user.email,
        body: "",
        subject: "Bem-vindo a Bulir",
        templateName: "account-created-successful.hbs",
        variable: {
          username: `${client?.firstName} ${client?.lastName}`
        }
      });
    }

    return right(null);
  }
}
