
import { SMSSender } from "@/domain/users/application/sms/sms-sender";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FakeSMSSender implements
  SMSSender{
  async send(data: { to: string; body: unknown; }): Promise<void> {
    console.log(`SMS send to: ${data.to} with info: ${data.body}`);
  }
  
}