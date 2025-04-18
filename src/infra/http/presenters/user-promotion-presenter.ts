import { UserPromotion } from "@/domain/users/enterprise/user-promotion";

export class UserPromotionPresenter {
  static toHTTP(promotion: UserPromotion) {
    return {
      id: promotion.id.toString(),
      promotion_id: promotion.promotionId.toString(),
      name: promotion.name,
      description: promotion.description,
      discount: promotion.discount,
      expires_at: promotion.expiresAt,
      state: promotion.state,
      user_id: promotion.userId,
      created_at: promotion.createdAt,
      updated_at: promotion.updatedAt
    };
  }
}