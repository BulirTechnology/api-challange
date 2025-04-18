import { Injectable } from "@nestjs/common";
import {
  I18nService
} from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { LanguageSlug, ServiceProvider } from "@/domain/users/enterprise";

import {
  ServiceProvidersRepository,
  UsersRepository,
  ClientsRepository
} from "../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientServiceProviderByServiceRequest {
  language: LanguageSlug
  perPage?: number
  page: number
  serviceId: string
  userId: string
}

type FetchClientServiceProviderByServiceResponse = Either<
  ResourceNotFoundError,
  {
    serviceProviders: ServiceProvider[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientServiceProviderByService {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private clientRepository: ClientsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    serviceId,
    perPage,
    userId
  }: FetchClientServiceProviderByServiceRequest): Promise<FetchClientServiceProviderByServiceResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));

    const client = await this.clientRepository.findByEmail(user.email);
    if (!client)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));

    const result = await this.serviceProvidersRepository.findOfService({
      page,
      serviceId,
      perPage,
      clientId: client.id.toString()
    });

    return right({
      serviceProviders: result.data,
      meta: result.meta
    });
  }
}
