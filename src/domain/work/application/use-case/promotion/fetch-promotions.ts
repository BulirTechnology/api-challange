import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Promotion } from "../../../enterprise";
import { PromotionsRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchPromotionsUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
}

type FetchPromotionsUseCaseResponse = Either<
  null,
  {
    promotions: Promotion[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchPromotionsUseCase {
  constructor(private promotionsRepository: PromotionsRepository) { }

  async execute({
    page,
    language,
    perPage
  }: FetchPromotionsUseCaseRequest): Promise<FetchPromotionsUseCaseResponse> {
    const promotions = await this.promotionsRepository.findMany({
      language,
      page,
      perPage
    });

    return right({
      promotions: promotions.data,
      meta: promotions.meta
    });
  }
}
