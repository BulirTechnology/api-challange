import { EmailPhoneUpdate } from "../../enterprise/email-phone-update";

export abstract class EmailPhoneUpdateRepository {
  abstract findByUserId(data: { type: "Email" | "Phone", userId: string }): Promise<EmailPhoneUpdate | null>
  abstract create(data: EmailPhoneUpdate): Promise<void>
  abstract delete(id: string): Promise<void>
}
