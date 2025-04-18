import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Service } from "../../../../enterprise";
import { ServicesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServicesByCategoryUseCaseRequest {
  page: number
  perPage?: number
  categoryId: string
  language: LanguageSlug
}

type FetchServicesByCategoryUseCaseResponse = Either<
  null,
  {
    services: Service[],
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServicesByCategoryUseCase {
  constructor(private servicesRepository: ServicesRepository) { }

  async execute({
    page,
    categoryId,
    perPage
  }: FetchServicesByCategoryUseCaseRequest): Promise<FetchServicesByCategoryUseCaseResponse> {
    const result = await this.servicesRepository.findManyByCategory({
      categoryId,
      page,
      perPage
    });

    return right({
      services: result.data,
      meta: result.meta
    });
  }
}
