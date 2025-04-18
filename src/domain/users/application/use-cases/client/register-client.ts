import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/core/errors";

import { Client, User, Otp, Notification } from "../../../enterprise";

import {
  ClientsRepository,
  OtpRepository,
  UsersRepository,
  NotificationsRepository,
} from "../../repositories";

import { AccountAlreadyExistsError } from "../errors";

import { HashGenerator, OTPGenerator } from "../../cryptography";
import { MailSender } from "../../mail/mail-sender";
import { SMSSender } from "../../sms/sms-sender";
import { DateProvider } from "../../date/date-provider";

import { generateReferralCode } from "../../helpers/generate-referral-code";

export type ClientCreate = {
  id: UniqueEntityID;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isEmailValidated: boolean;
  isPhoneNumberValidated: boolean;
  userId: UniqueEntityID;
};

interface RegisterClientUseCaseRequest {
  language: "en" | "pt";
  firstName: string;
  lastName: string;
  email: string;
  referredBy: string | null;
  phoneNumber: string;
  password: string;
}

type RegisterClientUseCaseResponse = Either<
  AccountAlreadyExistsError,
  {
    client: ClientCreate;
  }
>;

@Injectable()
export class RegisterClientUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private hashGenerator: HashGenerator,
    private mailSender: MailSender,
    private smsSender: SMSSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private notificationRepository: NotificationsRepository,
    private readonly i18n: I18nService
  ) {}

  async execute({
    email,
    firstName,
    lastName,
    password,
    phoneNumber,
    referredBy,
  }: RegisterClientUseCaseRequest): Promise<RegisterClientUseCaseResponse> {
    const userWithSameEmail =
      await this.usersRepository.findByEmailAndAccountType({
        email,
        accountType: "Client",
      });

    const userWithSamePhoneNumber =
      await this.usersRepository.findByPhoneNumberAndAccountType({
        phoneNumber,
        accountType: "Client",
      });

    if (
      userWithSamePhoneNumber &&
      userWithSamePhoneNumber.isPhoneNumberValidated
    ) {
      return left(new AccountAlreadyExistsError(email, "phoneNumber"));
    }

    if (userWithSameEmail) {
      if (
        userWithSameEmail.isEmailValidated &&
        userWithSameEmail.isPhoneNumberValidated
      ) {
        return left(new AccountAlreadyExistsError(email, "email"));
      } else {
        const clientRegistered = await this.clientsRepository.findByEmail(
          userWithSameEmail.email
        );

        if (!clientRegistered) {
          return left(
            new ResourceNotFoundError(
              this.i18n.t("errors.user.client_not_found", {
                lang: I18nContext.current()?.lang,
              })
            )
          );
        }

        const clientWithSamePhone =
          await this.clientsRepository.findByPhoneNumber(phoneNumber);
        if (clientWithSamePhone && clientWithSamePhone.isPhoneNumberValidated) {
          return left(
            new ResourceNotFoundError(
              "Já existe um usuario com este número de telefone"
            )
          );
        }

        await this.sendValidateOTP(clientRegistered);

        return right({
          client: {
            email: clientRegistered.email,
            firstName: clientRegistered.firstName,
            id: clientRegistered.id,
            isEmailValidated: userWithSameEmail.isEmailValidated,
            isPhoneNumberValidated: userWithSameEmail.isPhoneNumberValidated,
            lastName: clientRegistered.lastName,
            phoneNumber: clientRegistered.phoneNumber,
            userId: clientRegistered.userId,
          },
        });
      }
    }

    if (referredBy) {
      const existReferralCode =
        await this.usersRepository.existThisReferralCode(referredBy);

      if (!existReferralCode) {
        return left(new ResourceNotFoundError("Referral code not found"));
      }
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = User.create({
      email,
      phoneNumber,
      password: hashedPassword,
      accountType: "Client",
      isEmailValidated: false,
      notificationToken: "",
      defaultLanguage: "PORTUGUESE",
      isPhoneNumberValidated: false,
      isAuthenticated: false,
      refreshToken: "",
      authProvider: "email",
      referralCode: "",
      online: false,
      referredBy,
      alreadyLogin: false,
      socketId: "",
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    });

    await this.usersRepository.create(user);

    const userCreated = await this.usersRepository.findByEmail(email);

    if (!userCreated) {
      return left(
        new ResourceNotFoundError(
          this.i18n.t("errors.user.not_found", {
            lang: I18nContext.current()?.lang,
          })
        )
      );
    }
    await this.usersRepository.updateReferralCode(
      userCreated.id.toString(),
      generateReferralCode(userCreated.id.toString())
    );
    const client = Client.create({
      firstName,
      lastName,
      phoneNumber,
      state: "Inactive",
      email: user.email,
      userId: userCreated.id,
      bornAt: null,
    });

    const clientCreated = await this.clientsRepository.create(client);

    await this.sendValidateOTP(client);

    const notification = Notification.create({
      description: `${firstName} ${lastName} ${this.i18n.t(
        "errors.notification.register_success_description",
        { lang: "pt" }
      )}`,
      descriptionEn: `${firstName} ${lastName} ${this.i18n.t(
        "errors.notification.register_success_description",
        { lang: "en" }
      )}`,
      readed: false,
      title: this.i18n.t("errors.notification.register_success_title", {
        lang: "pt",
      }),
      titleEn: this.i18n.t("errors.notification.register_success_title", {
        lang: "en",
      }),
      userId: userCreated.id,
      parentId: null,
      type: "RegisterSuccess",
    });
    await this.notificationRepository.create(notification);

    return right({
      client: {
        email: client.email,
        firstName: client.firstName,
        id: clientCreated.id,
        isEmailValidated: false,
        isPhoneNumberValidated: false,
        lastName: client.lastName,
        phoneNumber: client.phoneNumber,
        userId: client.userId,
      },
    });
  }

  private async sendValidateOTP(client: Client) {
    const expiresDate = this.dateProvider.addHours(3);

    if (!client.isEmailValidated) {
      const emailCode = await this.otpGenerator.generate();
      const emailOTP = Otp.create({
        code: emailCode,
        expiresAt: expiresDate,
        isVerified: false,
        userId: client.userId,
        verificationType: "Email",
        createdAt: new Date(),
      });
      await this.otpRepository.create(emailOTP);

      await this.mailSender.send({
        to: client.email,
        body: emailOTP.code,
        subject: this.i18n.t("errors.account.validate_account", {
          lang: I18nContext.current()?.lang,
        }),
        templateName: "account-email-verification.hbs",
        variable: {
          username: client.firstName + " " + client.lastName,
          otpCode: emailOTP.code,
        },
      });
    } else if (!client.isPhoneNumberValidated) {
      const phoneCode = await this.otpGenerator.generate();

      const phoneNumberOTP = Otp.create({
        code: phoneCode,
        expiresAt: expiresDate,
        isVerified: false,
        userId: client.userId,
        verificationType: "PhoneNumber",
        createdAt: new Date(),
      });

      await this.otpRepository.create(phoneNumberOTP);

      await this.smsSender.send({
        to: client.phoneNumber,
        body: "O codigo OTP " + phoneNumberOTP.code,
        email: client.email,
      });
    }
  }
}
