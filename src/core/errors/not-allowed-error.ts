import { UseCaseError } from "@/core/errors/use-case-error";

export class NotAllowedError extends Error implements UseCaseError {
  field: string;
  constructor() {
    super("Not allowed");
    this.field = "";
  }
}
