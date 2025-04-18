import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  ServiceProvidersRepository,
  SpecializationsRepository,
  OtpRepository,
} from "@/domain/users/application/repositories";
import { ServicesRepository } from "@/domain/work/application/repositories";

import {
  Specialization,
  ServiceProvider,
  LanguageSlug
} from "@/domain/users/enterprise";

import { Otp } from "../../../../enterprise/otp";
import { MailSender } from "../../../mail/mail-sender";
import { DateProvider } from "../../../date/date-provider";
import { OTPGenerator } from "../../../cryptography/otp-generator";

type SpecializationProps = {
  serviceId: string
  rate: "HOURLY" | "FIXED",
  price: number
}

interface SetupFirstSpecializationToServiceProviderUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  specializations: SpecializationProps[]
}

type SetupFirstSpecializationToServiceProviderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
    nextStep: string,
    serviceProvider: ServiceProvider,
    specializations: Specialization[]
  }
>

@Injectable()
export class SetupFirstSpecializationToServiceProviderUseCase {
  constructor(
    private serviceProviderRepository: ServiceProvidersRepository,
    private specializationRepository: SpecializationsRepository,
    private mailSender: MailSender,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private otpGenerator: OTPGenerator,
    private service: ServicesRepository
  ) { }

  async execute({
    specializations,
    serviceProviderId,
    language
  }: SetupFirstSpecializationToServiceProviderUseCaseRequest): Promise<SetupFirstSpecializationToServiceProviderUseCaseResponse> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("User not found"));
    }

    let shouldContinue = true
    for (const item of specializations) {
      const service = await this.service.findById({ id: item.serviceId, language });

      if (!service) {
        shouldContinue = false;
        break
      }
    }

    if (!shouldContinue) {
      return left(new ResourceNotFoundError("One of the services provided do not exist"))
    }

    const specificationCreated: Specialization[] = []
    await this.specializationRepository.deleteManyOfSp({
      serviceProviderId: serviceProviderId
    })
    for (const item of specializations) {
      const service = await this.service.findById({ id: item.serviceId, language });

      if (!service) continue;

      const specialization = Specialization.create({
        price: item.price,
        rate: item.rate,
        serviceId: new UniqueEntityID(item.serviceId),
        serviceProviderId: new UniqueEntityID(serviceProviderId),
        title: ""
      });
      const data = await this.specializationRepository.create(specialization);
      specificationCreated.push(data)
    }

    const emailCode = await this.otpGenerator.generate();
    const expiresDate = this.dateProvider.addHours(3);

    const emailOTP = Otp.create({
      code: emailCode,
      expiresAt: expiresDate,
      isVerified: false,
      userId: serviceProvider.userId,
      verificationType: "Email",
      createdAt: new Date(),
    });
    await this.otpRepository.create(emailOTP);

    this.mailSender.send({
      to: serviceProvider.email,
      body: emailOTP.code, // submit the client email otp
      subject: "OTP to validate email",
      templateName: "account-email-verification.hbs",
      variable: {
        username: serviceProvider.firstName + " " + serviceProvider.lastName,
        otpCode: emailOTP.code,
      }
    });

    return right({
      message: "Specifications updated",
      nextStep: "ValidateEmail",
      serviceProvider,
      specializations: specificationCreated
    });
  }
}
