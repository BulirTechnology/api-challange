import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  UserPromotionsRepository
} from "../../repositories";
import { PromotionsRepository } from "@/domain/work/application/repositories";
import {
  InvalidPromotionCodeError,
  PromotionAlreadyInUseError
} from "../errors";

import { DateProvider } from "../../date/date-provider";
import { UserPromotion } from "../../../enterprise";

interface AddPromotionToUserUseCaseRequest {
  language: "en" | "pt"
  userId: string
  promotionCode: string
}

type AddPromotionToUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    promotion: UserPromotion
  }
>

@Injectable()
export class AddPromotionToUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private promotionRepository: PromotionsRepository,
    private userPromotionsRepository: UserPromotionsRepository,
    private dateProvider: DateProvider
  ) { }

  async execute({
    promotionCode,
    userId,
    language
  }: AddPromotionToUserUseCaseRequest): Promise<AddPromotionToUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const currentPromotion = await this.promotionRepository.findByCode({
      name: promotionCode,
      language
    });

    if (!currentPromotion) {
      return left(new ResourceNotFoundError("Promotion code not found"));
    }

    if (currentPromotion.promotionFor !== user.accountType) {
      return left(new InvalidPromotionCodeError());
    }

    const totalPromotionUsed = await this.userPromotionsRepository.countPromotions(promotionCode);

    if (currentPromotion.maxAllowedUser <= totalPromotionUsed) {
      return left(new InvalidPromotionCodeError());
    }

    if (this.dateProvider.compareInDays(new Date(), currentPromotion.expiresAt) <= 0) {
      return left(new InvalidPromotionCodeError());
    }

    const totalUserPromotions = await this.userPromotionsRepository.countUserPromotions({
      promotionId: currentPromotion.id.toString(),
      userId: userId
    });

    if (totalUserPromotions > 0) {
      return left(new PromotionAlreadyInUseError(promotionCode));
    }

    const userPromotionCode = UserPromotion.create({
      promotionId: currentPromotion.id.toString(),
      userId,
      discount: currentPromotion.discount,
    });

    const result = await this.userPromotionsRepository.create(userPromotionCode);

    return right({
      promotion: result
    });
  }
}
