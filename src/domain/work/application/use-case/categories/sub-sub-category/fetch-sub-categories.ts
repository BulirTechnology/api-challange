import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { SubCategory } from "../../../../enterprise";
import { SubCategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchSubCategoriesUseCaseRequest {
  page: number
  perPage?: number
  categoryId: string
  language: LanguageSlug
}

type FetchSubCategoriesUseCaseResponse = Either<
  null,
  {
    subCategories: SubCategory[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchSubCategoriesUseCase {
  constructor(private subCategoriesRepository: SubCategoriesRepository) { }

  async execute({
    page,
    categoryId,
    language,
    perPage
  }: FetchSubCategoriesUseCaseRequest): Promise<FetchSubCategoriesUseCaseResponse> {
    const result = await this.subCategoriesRepository.findMany({
      page,
      perPage,
      categoryId,
      language
    });

    return right({
      subCategories: result.data,
      meta: result.meta
    });
  }
}
