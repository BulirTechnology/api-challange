import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";

import {
  Promotion,
  PromotionType
} from "../../../enterprise";
import { PromotionsRepository } from "../../repositories";
import { AccountType, LanguageSlug } from "@/domain/users/enterprise";
import { PromotionAlreadyInUseError } from "@/domain/users/application/use-cases/errors";

interface CreatePromotionUseCaseRequest {
  language: LanguageSlug
  name: string
  maxAllowedUser: number
  discount: number
  description: string
  promotionType: PromotionType
  promotionFor: AccountType,
  expiresAt: Date
}

type CreatePromotionUseCaseResponse = Either<
  PromotionAlreadyInUseError,
  {
    promotion: Promotion
  }
>

@Injectable()
export class CreatePromotionUseCase {
  constructor(
    private promotionsRepository: PromotionsRepository,
  ) { }

  async execute({
    description,
    discount,
    maxAllowedUser,
    name,
    promotionFor,
    expiresAt,
    promotionType,
    language
  }: CreatePromotionUseCaseRequest): Promise<CreatePromotionUseCaseResponse> {
    const exist = await this.promotionsRepository.findByCode({
      name,
      language
    });

    if (exist) {
      return left(new PromotionAlreadyInUseError(""));
    }

    const promotion = Promotion.create({
      description: language === "pt" ? description : "",
      descriptionEn: language === "en" ? description : "",
      discount,
      maxAllowedUser,
      name: name.toUpperCase(),
      promotionFor,
      status: "ACTIVE",
      promotionType,
      expiresAt: new Date(expiresAt),
    });

    await this.promotionsRepository.create(promotion);

    return right({
      promotion,
    });
  }
}
