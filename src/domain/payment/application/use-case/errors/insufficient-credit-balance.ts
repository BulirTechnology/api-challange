import { UseCaseError } from "@/core/errors/use-case-error";

export class InsufficientCreditBalanceError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("You have insufficient credit on your account");
    this.field = "credit";
  }
}