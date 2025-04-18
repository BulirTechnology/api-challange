import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidResourceError extends Error
  implements UseCaseError {
  field: string;
  constructor(message: string) {
    super(message);
    this.field = "address";
  }
}