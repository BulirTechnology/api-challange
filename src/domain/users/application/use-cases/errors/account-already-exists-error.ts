import { UseCaseObjectError } from "@/core/errors/use-case-error";

export class AccountAlreadyExistsError extends Error
  implements UseCaseObjectError {
  field: string;
  constructor(identifier: string, field: string) {
    super(`Account "${identifier}" already exists`);
    this.field = field;
  }
}