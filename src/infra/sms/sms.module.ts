import { SMSSender } from "@/domain/users/application/sms/sms-sender";
import { Module } from "@nestjs/common";
import { MimoSMSSender } from "./mimo-sms-sender";
import { EnvService } from "../environment/env.service";

@Module({
  providers: [
    EnvService,
    {
      provide: SMSSender,
      useClass: MimoSMSSender
    },
  ],
  exports: [
    SMSSender,
  ]
})
export class SMSModule {}
