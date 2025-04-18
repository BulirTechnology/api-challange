import { Otp } from "../../enterprise/otp";

export abstract class OtpRepository {
  abstract findByUserIdAndCode(data: { code: string, userId: string }): Promise<Otp | null>
  abstract create(otp: Otp): Promise<void>
  abstract validate(id: string): Promise<void>
  abstract delete(data: { userId: string }): Promise<void>
}
