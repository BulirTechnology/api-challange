import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidPromotionCodeError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("Invalid promotion code");
    this.field = "promotion_code";
  }
}