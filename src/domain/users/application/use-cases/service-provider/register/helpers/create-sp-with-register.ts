import { left, right } from "@/core/either";
import {
  User,
  ServiceProvider,
  Address
} from "@/domain/users/enterprise";

import {
  DEFAULT_PASSWORD,
  RegisterServiceProviderUseCaseRequest,
  RegisterServiceProviderUseCaseResponse
} from "../register-service-provider";
import { AccountAlreadyExistsError } from "../../../errors";

import {
  ServiceProvidersRepository,
  DocumentRepository,
  OtpRepository,
  AddressesRepository,
  SpecializationsRepository
} from "@/domain/users/application/repositories";

import { sendEmailOTP } from "./send-email-otp";
import { sendPhoneNumberOTP } from "./send-phone-otp";

import { MailSender } from "@/domain/users/application/mail/mail-sender";
import { DateProvider } from "@/domain/users/application/date/date-provider";
import { SMSSender } from "@/domain/users/application/sms/sms-sender";
import { OTPGenerator } from "@/domain/users/application/cryptography/otp-generator";

export async function createServiceProviderWithRegister(
  props: RegisterServiceProviderUseCaseRequest,
  user: User,
  serviceProvidersRepository: ServiceProvidersRepository,
  documentsRepository: DocumentRepository,
  mailSender: MailSender,
  otpRepository: OtpRepository,
  dateProvider: DateProvider,
  otpGenerator: OTPGenerator,
  smsSender: SMSSender,
  addressesRepository: AddressesRepository,
  specializationRepository: SpecializationsRepository
)
  : Promise<RegisterServiceProviderUseCaseResponse> {
  if (user.isEmailValidated && user.isPhoneNumberValidated) {
    return left(new AccountAlreadyExistsError(props.email, "email"));
  }
  else {
    const currentSP = await serviceProvidersRepository.findByEmail(props.email);

    if (!currentSP) {
      const serviceProvider = ServiceProvider.create({
        bornAt: props.bornAt,
        firstName: props.firstName,
        gender: props.gender,
        lastName: props.lastName,
        phoneNumber: props.phoneNumber,
        state: "Inactive",
        email: user.email,
        userId: user.id,
        description: "",
        isFavorite: false,
        education: "SecondaryEducation",
        profileUrl: "",
        hasBudget: false,
        hasCertificateByBulir: false,
        rating: 0
      });

      const addressCreated = Address.create({
        isPrimary: true,
        latitude: props.address.latitude,
        line1: props.address.line1,
        line2: props.address.line2,
        longitude: props.address.longitude,
        name: props.address.name,
        userId: user.id
      });
      await addressesRepository.create(addressCreated);

      const response = await serviceProvidersRepository.create(serviceProvider);

      return right({
        serviceProvider: response,
        nextStep: "UploadDocument"
      });
    }

    // check is has documents
    const documents = await documentsRepository.findByUserIdAndType(currentSP.id.toString(), "BI_FRONT");

    const serviceProviderToReturn = ServiceProvider.create({
      bornAt: currentSP.bornAt,
      email: user.email,
      firstName: currentSP.firstName,
      gender: currentSP.gender,
      lastName: currentSP.lastName,
      phoneNumber: user.phoneNumber,
      userId: currentSP.userId,
      state: "Inactive",
      description: "",
      isFavorite: false,
      education: "SecondaryEducation",
      profileUrl: "",
      hasBudget: false,
      hasCertificateByBulir: false,
      rating: 0
    }, currentSP.id);

    if (!documents || documents === null) {
      return right({
        nextStep: "UploadDocument",
        serviceProvider: serviceProviderToReturn
      });
    }

    // check if he set the password
    if (user?.password === DEFAULT_PASSWORD) {
      return right({
        nextStep: "SetPassword",
        serviceProvider: serviceProviderToReturn
      });
    }

    const hasService = specializationRepository.findByServiceProviderId(serviceProviderToReturn.id.toString());
    if (!hasService) {
      return right({
        nextStep: "AddService",
        serviceProvider: serviceProviderToReturn
      });
    }

    // check if he validate the email
    if (!user.isEmailValidated) {
      console.log("entrou aqui");
      await sendEmailOTP(
        currentSP,
        mailSender,
        otpRepository,
        dateProvider,
        otpGenerator
      );

      return right({
        nextStep: "ValidateEmail",
        serviceProvider: serviceProviderToReturn
      });
    }

    // check if he validate the phone number
    await sendPhoneNumberOTP(
      currentSP,
      mailSender,
      otpRepository,
      dateProvider,
      otpGenerator,
      smsSender
    );
    return right({
      nextStep: "ValidatedPhoneNumber",
      serviceProvider: serviceProviderToReturn
    });
  }
}