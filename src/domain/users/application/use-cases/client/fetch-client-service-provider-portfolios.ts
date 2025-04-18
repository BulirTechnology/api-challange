import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { LanguageSlug, Portfolio } from "../../../enterprise";

import {
  PortfoliosRepository,
  UsersRepository,
  ServiceProvidersRepository
} from "../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientServiceProviderPortfoliosUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  userId: string
  serviceProviderId: string
}

type FetchClientServiceProviderPortfoliosUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: Portfolio[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientServiceProviderPortfoliosUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private portfoliosRepository: PortfoliosRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    userId,
    serviceProviderId,
    perPage
  }: FetchClientServiceProviderPortfoliosUseCaseRequest): Promise<FetchClientServiceProviderPortfoliosUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));

    const serviceProvider = await this.serviceProvidersRepository.findById(serviceProviderId);

    if (!serviceProvider)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));

    const portfolios = await this.portfoliosRepository.findMany({
      page,
      serviceProviderId: serviceProvider.id.toString(),
      perPage
    });

    return right({
      data: portfolios.data,
      meta: portfolios.meta
    });
  }
}
