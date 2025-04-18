import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  UsersRepository,
  ClientServiceProviderFavoriteRepository,
  ClientsRepository
} from "../../repositories";

import { LanguageSlug, ServiceProvider } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientServiceProviderFavoriteUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  userId: string
}

type FetchClientServiceProviderFavoriteUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: ServiceProvider[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientServiceProviderFavoriteUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientServiceProviderRepository: ClientServiceProviderFavoriteRepository,
    private clientRepository: ClientsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    userId,
    perPage
  }: FetchClientServiceProviderFavoriteUseCaseRequest): Promise<FetchClientServiceProviderFavoriteUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);
    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const favorites = await this.clientServiceProviderRepository.findMany({
      page,
      clientId: client.id.toString(),
      perPage
    });

    return right({
      data: favorites.data,
      meta: favorites.meta
    });
  }
}
