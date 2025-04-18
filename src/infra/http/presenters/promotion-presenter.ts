import { Promotion } from "@/domain/work/enterprise/promotion";

export class PromotionPresenter {
  static toHTTP(promotion: Promotion) {
    return {
      id: promotion.id.toString(),
      name: promotion.name,
      description: promotion.description,
      discount: promotion.discount,
      max_allowed_user: promotion.maxAllowedUser,
      promotion_for: promotion.promotionFor,
      promotion_type: promotion.promotionType,
      status: promotion.status,
      expires_at: promotion.expiresAt,
      created_at: promotion.createdAt,
      updated_at: promotion.updatedAt
    };
  }
}