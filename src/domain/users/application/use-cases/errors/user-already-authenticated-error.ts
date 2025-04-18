import { UseCaseError } from "@/core/errors/use-case-error";

export class UserAlreadyAuthenticatedError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("User already authenticated");
    this.field = "account";
  }
}