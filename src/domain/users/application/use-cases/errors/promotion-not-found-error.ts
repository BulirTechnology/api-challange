import { UseCaseError } from "@/core/errors/use-case-error";

export class PromotionNotFoundError extends Error
  implements UseCaseError {
  field: string;
  constructor(promotionCode: string) {
    super(`Promotion code "${promotionCode}" not found`);
    this.field = "promotion_code";
  }
}