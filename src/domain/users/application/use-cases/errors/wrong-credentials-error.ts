import { UseCaseError } from "@/core/errors/use-case-error";

export class WrongCredentialsError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("Credentials are not valid");
    this.field = "credentials";
  }
}