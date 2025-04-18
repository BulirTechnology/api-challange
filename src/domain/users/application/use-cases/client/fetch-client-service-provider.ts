import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { MetaPagination } from "@/core/repositories/pagination-params";
import {
  Either,
  left,
  right
} from "@/core/either";

import {
  ServiceProvidersRepository,
  UsersRepository,
  ClientServiceProviderFavoriteRepository,
  ClientsRepository
} from "../../repositories";
import {
  EducationLevel,
  GenderProps,
  UserState
} from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchServiceProviderUseCaseRequest {
  language: "en" | "pt"
  name: string
  page: number
  perPage?: number
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

type FetchServiceProviderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: ClientServiceProvider[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientServiceProviderUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private clientServiceProviderRepository: ClientServiceProviderFavoriteRepository,
    private clientRepository: ClientsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    name,
    userId,
    perPage
  }: FetchServiceProviderUseCaseRequest):
    Promise<FetchServiceProviderUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));

    const client = await this.clientRepository.findByEmail(user.email);
    if (!client)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));

    const serviceProviders = await this.serviceProvidersRepository.findMany({
      page,
      perPage,
      name
    });

    const response: ClientServiceProvider[] = [];
    for (const serviceProvider of serviceProviders.data) {
      const isFavorite = await this.clientServiceProviderRepository.isFavorite({
        clientId: client.id.toString(),
        serviceProviderId: serviceProvider.id.toString()
      });

      response.push({
        bornAt: serviceProvider.bornAt,
        createdAt: serviceProvider.createdAt,
        description: serviceProvider.description,
        education: serviceProvider.education,
        email: serviceProvider.email,
        firstName: serviceProvider.firstName,
        gender: serviceProvider.gender,
        hasBudget: serviceProvider.hasBudget,
        hasCertificateByBulir: serviceProvider.hasCertificateByBulir,
        id: serviceProvider.id,
        isApproved: serviceProvider.isApproved,
        isEmailValidated: serviceProvider.isEmailValidated,
        isFavorite,
        isPhoneNumberValidated: serviceProvider.isPhoneNumberValidated,
        lastName: serviceProvider.lastName,
        phoneNumber: serviceProvider.phoneNumber,
        profileUrl: serviceProvider.profileUrl,
        rating: serviceProvider.rating,
        state: serviceProvider.state,
        updatedAt: serviceProvider.updatedAt,
        userId: serviceProvider.userId,
      });
    }

    return right({
      data: response,
      meta: serviceProviders.meta
    });
  }
}
