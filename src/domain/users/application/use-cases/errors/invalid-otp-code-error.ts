import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidOTPCodeError extends Error
  implements UseCaseError {
  field: string;
  constructor() {
    super("Invalid OTP code");
    this.field = "otp";
  }
}