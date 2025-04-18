import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidNotificationError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("Invalid notification");
    this.field = "notifications";
  }
}