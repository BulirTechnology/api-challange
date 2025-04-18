import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Category } from "../../../../enterprise";

import { CategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchCategoriesUseCaseRequest {
  page: number
  language: LanguageSlug
  perPage?: number
}

type FetchCategoriesUseCaseResponse = Either<
  null,
  {
    categories: Category[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) { }

  async execute({
    page,
    language,
    perPage
  }: FetchCategoriesUseCaseRequest): Promise<FetchCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.findMany({
      language,
      page,
      perPage
    });

    return right({
      categories: categories.data,
      meta: categories.meta
    });
  }
}
