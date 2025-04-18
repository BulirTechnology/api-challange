import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProvidersRepository,
  UsersRepository,
  ClientServiceProviderFavoriteRepository,
  ClientsRepository
} from "../../repositories";
import {
  EducationLevel,
  GenderProps,
  LanguageSlug,
  UserState
} from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchServiceProviderDetailsUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  userId: string
}

export type ClientServiceProvider = {
  id: UniqueEntityID
  isFavorite: boolean
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  bornAt: Date
  gender: GenderProps
  address?: []
  description: string
  education: EducationLevel
  isApproved?: boolean
  isEmailValidated?: boolean
  isPhoneNumberValidated?: boolean
  state: UserState
  profileUrl: string | null
  rating: number
  hasBudget: boolean
  hasCertificateByBulir: boolean
  userId: UniqueEntityID
  createdAt?: Date | null
  updatedAt?: Date | null
}

type FetchServiceProviderDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: ClientServiceProvider
  }
>

@Injectable()
export class FetchClientServiceProviderDetailsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private clientServiceProviderRepository: ClientServiceProviderFavoriteRepository,
    private clientRepository: ClientsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    serviceProviderId,
    userId
  }: FetchServiceProviderDetailsUseCaseRequest):
    Promise<FetchServiceProviderDetailsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);
    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    if (!serviceProviderId) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));
    }

    const serviceProviderDetails = await this.serviceProvidersRepository.findById(serviceProviderId);

    if (!serviceProviderDetails) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));
    }

    const isFavorite = await this.clientServiceProviderRepository.isFavorite({
      clientId: client.id.toString(),
      serviceProviderId: serviceProviderId
    });

    return right({
      data: {
        bornAt: serviceProviderDetails.bornAt,
        createdAt: serviceProviderDetails.createdAt,
        description: serviceProviderDetails.description,
        education: serviceProviderDetails.education,
        email: serviceProviderDetails.email,
        firstName: serviceProviderDetails.firstName,
        gender: serviceProviderDetails.gender,
        hasBudget: serviceProviderDetails.hasBudget,
        hasCertificateByBulir: serviceProviderDetails.hasCertificateByBulir,
        id: serviceProviderDetails.id,
        isApproved: serviceProviderDetails.isApproved,
        isEmailValidated: serviceProviderDetails.isEmailValidated,
        isFavorite,
        isPhoneNumberValidated: serviceProviderDetails.isPhoneNumberValidated,
        lastName: serviceProviderDetails.lastName,
        phoneNumber: serviceProviderDetails.phoneNumber,
        profileUrl: serviceProviderDetails.profileUrl,
        rating: serviceProviderDetails.rating,
        state: serviceProviderDetails.state,
        updatedAt: serviceProviderDetails.updatedAt,
        userId: serviceProviderDetails.userId,
      },
    });
  }
}
