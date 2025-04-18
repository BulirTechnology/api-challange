import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  ServiceProvider,
} from "@/domain/users/enterprise";
import { ServiceProvidersRepository } from "../../repositories/service-provider-repository";

interface FetchServiceProviderOfServiceUseCaseRequest {
  language: "en" | "pt"
  perPage?: number
  page: number
  serviceId: string
}

type FetchServiceProviderOfServiceUseCaseResponse = Either<
  null,
  {
    serviceProviders: ServiceProvider[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServiceProviderOfServiceUseCase {
  constructor(private serviceProvidersRepository: ServiceProvidersRepository) { }

  async execute({
    page,
    serviceId,
    perPage
  }: FetchServiceProviderOfServiceUseCaseRequest): Promise<FetchServiceProviderOfServiceUseCaseResponse> {
    const result = await this.serviceProvidersRepository.findOfService({
      page,
      serviceId,
      perPage
    });

    return right({
      serviceProviders: result.data,
      meta: result.meta
    });
  }
}
