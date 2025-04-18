import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { SubSubCategory } from "../../../../enterprise";
import { SubSubCategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchSubSubCategoriesUseCaseRequest {
  page: number
  perPage?: number
  subCategoryId: string
  language: LanguageSlug
}

type FetchSubSubCategoriesUseCaseResponse = Either<
  null,
  {
    subSubCategories: SubSubCategory[],
    meta: MetaPagination
  }
>

@Injectable()
export class FetchSubSubCategoriesUseCase {
  constructor(private subSubCategoriesRepository: SubSubCategoriesRepository) { }

  async execute({
    page,
    subCategoryId,
    language,
    perPage
  }: FetchSubSubCategoriesUseCaseRequest): Promise<FetchSubSubCategoriesUseCaseResponse> {
    const result = await this.subSubCategoriesRepository.findMany({
      language,
      subCategoryId,
      page,
      perPage
    });

    return right({
      subSubCategories: result.data,
      meta: result.meta
    });
  }
}
