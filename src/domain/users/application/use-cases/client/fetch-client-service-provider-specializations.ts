import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { LanguageSlug, Specialization } from "../../../enterprise";

import {
  SpecializationsRepository,
  ServiceProvidersRepository,
  UsersRepository
} from "../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientServiceProviderSpecializationUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  userId: string
  serviceProviderId: string
}

type FetchClientServiceProviderSpecializationUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: Specialization[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientServiceProviderSpecializationsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private specializationsRepository: SpecializationsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    userId,
    serviceProviderId,
    perPage
  }: FetchClientServiceProviderSpecializationUseCaseRequest): Promise<FetchClientServiceProviderSpecializationUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const serviceProvider = await this.serviceProvidersRepository.findById(serviceProviderId);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));
    }

    const specializations = await this.specializationsRepository.findMany({
      page,
      perPage,
      serviceProviderId: serviceProvider.id.toString()
    });

    return right({
      data: specializations.data,
      meta: specializations.meta
    });
  }
}
