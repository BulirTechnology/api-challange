import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserPromotion } from "@/domain/users/enterprise/user-promotion";
import { PromotionType } from "@/domain/work/enterprise/promotion";
import { UserPromotion as PrismaUserPromotion } from "@prisma/client";

type PrismaUserPromotionType = PrismaUserPromotion & {
  description: string,
  discount: number,
  expiresAt: Date,
  name: string
  promotionType: string
}

export class PrismaUserPromotionMapper {
  static toDomain(info: PrismaUserPromotionType): UserPromotion {
    return UserPromotion.create({
      promotionId: info.promotionId,
      userId: info.userId,
      state: info.state,
      description: info.description,
      discount: info.discount,
      expiresAt: info.expiresAt,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      name: info.name,
      promotionType: info.promotionType  as PromotionType
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(promotion: UserPromotion): PrismaUserPromotion {
    return {
      id: promotion.id.toString(),
      promotionId: promotion.promotionId,
      userId: promotion.userId,
      state: promotion.state,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}