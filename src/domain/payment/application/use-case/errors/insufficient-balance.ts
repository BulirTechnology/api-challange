import { UseCaseError } from "@/core/errors/use-case-error";

export class InsufficientBalanceError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("You have insufficient money on your account");
    this.field = "balance";
  }
}