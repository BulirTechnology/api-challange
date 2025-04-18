
import { MailSender } from "@/domain/users/application/mail/mail-sender";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FakeMailSender implements
  MailSender{
  async send(data: { to: string; body: unknown; }): Promise<void> {
    console.log(`Mail send to: ${data.to} with info: ${data.body}`);
  }
  
}