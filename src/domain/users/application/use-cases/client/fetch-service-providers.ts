import { Injectable } from "@nestjs/common";

import { Either, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  ServiceProvidersRepository
} from "../../repositories";
import {
  LanguageSlug,
  ServiceProvider
} from "@/domain/users/enterprise";

interface FetchServiceProvidersUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  /* userId: string */
  name?: string
}

type FetchServiceProvidersUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: ServiceProvider[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServiceProvidersUseCase {
  constructor(
    private serviceProvidersRepository: ServiceProvidersRepository,
  ) { }

  async execute({
    page,
    name,
    perPage
  }: FetchServiceProvidersUseCaseRequest): Promise<FetchServiceProvidersUseCaseResponse> {

    const serviceProviders = await this.serviceProvidersRepository.findMany({
      page,
      name,
      perPage
    });

    return right({
      data: serviceProviders.data,
      meta: serviceProviders.meta
    });
  }
}
