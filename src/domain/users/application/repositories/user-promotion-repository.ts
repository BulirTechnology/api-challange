import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { UserPromotion, UserPromotionState } from "../../enterprise/user-promotion";

export abstract class UserPromotionsRepository {
  abstract findById(id: string): Promise<UserPromotion | null>
  abstract findMany(params: PaginationParams & { userId: string }): Promise<Pagination<UserPromotion>>
  abstract findByPromotionIdAndUserId(params: { promotionId: string, userId: string }): Promise<UserPromotion | null>
  abstract countUserPromotions(params: { promotionId: string, userId: string }): Promise<number>
  abstract countPromotions(promotionCode: string): Promise<number>
  abstract create(data: UserPromotion): Promise<UserPromotion>
  abstract updateState(id: string, state: UserPromotionState): Promise<void>
}