import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { UserPromotionsRepository } from "../../repositories";
import { UserPromotion } from "@/domain/users/enterprise";

interface FetchUserPromotionsUseCaseRequest {
  language: "en" | "pt"
  page: number
  perPage?: number
  userId: string
}

type FetchUserPromotionsUseCaseResponse = Either<
  null,
  {
    userPromotions: UserPromotion[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchUserPromotionsUseCase {
  constructor(private userPromotionsRepository: UserPromotionsRepository) { }

  async execute({
    page,
    userId,
    perPage
  }: FetchUserPromotionsUseCaseRequest): Promise<FetchUserPromotionsUseCaseResponse> {
    const userPromotions = await this.userPromotionsRepository.findMany({ page, userId, perPage });

    return right({
      userPromotions: userPromotions.data,
      meta: userPromotions.meta
    });
  }
}
