import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";
import { ResourceNotFoundError } from "@/core/errors";

import { Client, LanguageSlug } from "@/domain/users/enterprise";
import { ClientsRepository } from "../../repositories";

interface FetchClientsUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  userId: string
  name: string
}

type FetchClientsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: Client[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientsUseCase {
  constructor(
    private clientsRepository: ClientsRepository,
  ) { }

  async execute({
    page,
    name,
    perPage
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const clients = await this.clientsRepository.findMany({
      page,
      name,
      perPage
    });

    return right({
      data: clients.data,
      meta: clients.meta
    });
  }
}
