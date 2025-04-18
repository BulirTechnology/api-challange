import { UseCaseError } from "@/core/errors/use-case-error";

export class HavePendingQuotationError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("You have a pending quotation in this job");
    this.field = "quotation";
  }
}