import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidAddressError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("Invalid address");
    this.field = "address";
  }
}