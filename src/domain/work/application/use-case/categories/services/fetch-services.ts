import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Service } from "../../../../enterprise";
import { ServicesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServicesUseCaseRequest {
  page: number
  perPage?: number
  subSubcategoryId: string
  language: LanguageSlug
}

type FetchServicesUseCaseResponse = Either<
  null,
  {
    services: Service[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServicesUseCase {
  constructor(private servicesRepository: ServicesRepository) { }

  async execute({
    page,
    subSubcategoryId,
    language,
    perPage
  }: FetchServicesUseCaseRequest): Promise<FetchServicesUseCaseResponse> {
    const result = await this.servicesRepository.findMany({
      language,
      subSubcategoryId,
      page,
      perPage
    });

    return right({
      services: result.data,
      meta: result.meta
    });
  }
}
