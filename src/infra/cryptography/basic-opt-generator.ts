import { OTPGenerator } from "@/domain/users/application/cryptography/otp-generator";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BasicOtpGenerator implements
  OTPGenerator {
  private generateOTP(length = 4) {
    const digits = "0123456789";
    return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
  }
  async generate(): Promise<string> {
    return this.generateOTP();
  }

}