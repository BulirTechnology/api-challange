import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Service } from "../../../../enterprise";
import { ServicesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchSubCategoryServicesUseCaseRequest {
  page: number
  perPage?: number
  subCategoryId: string
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
export class FetchSubCategoryServicesUseCase {
  constructor(private servicesRepository: ServicesRepository) { }

  async execute({
    page,
    subCategoryId,
    language,
    perPage
  }: FetchSubCategoryServicesUseCaseRequest): Promise<FetchServicesUseCaseResponse> {
    const result = await this.servicesRepository.findManyBySubCategory({
      language,
      page,
      subCategoryId,
      perPage
    });

    return right({
      services: result.data,
      meta: result.meta
    });
  }
}
