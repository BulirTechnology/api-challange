import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Promotion, PromotionType } from "@/domain/work/enterprise/promotion";
import { Promotion as PrismaPromotion } from "@prisma/client";

export class PrismaPromotionMapper {
  static toDomain(info: PrismaPromotion, language: "en" | "pt"): Promotion {
    return Promotion.create({
      description: language === "en" ? info.descriptionEn : info.description,
      descriptionEn: info.descriptionEn,
      discount: info.discount,
      maxAllowedUser: info.maxAllowedUser,
      name: info.name,
      promotionFor: info.promotionFor,
      status: info.status,
      promotionType: info.promotionType as PromotionType,
      expiresAt: info.expiresAt,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(promotion: Promotion): PrismaPromotion {
    return {
      id: promotion.id.toString(),
      name: promotion.name,
      expiresAt: promotion.expiresAt,
      description: promotion.description,
      descriptionEn: promotion.descriptionEn,
      discount: promotion.discount,
      maxAllowedUser: promotion.maxAllowedUser,
      promotionFor: promotion.promotionFor,
      promotionType: promotion.promotionType,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: promotion.status,
    };
  }
}