import { UseCaseError } from "@/core/errors/use-case-error";

export class PromotionAlreadyInUseError extends Error
  implements UseCaseError {
  field: string;
  constructor(promotion: string) {
    super(`Promotion code "${promotion}" already in use`);
    this.field = "promotion_code";
  }
}