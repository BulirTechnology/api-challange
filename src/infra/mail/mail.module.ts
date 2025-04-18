import { MailSender } from "@/domain/users/application/mail/mail-sender";
import { Module } from "@nestjs/common";

import { EnvService } from "../environment/env.service";
import { SendGridService } from "./sendgrid-mail";

@Module({
  providers: [
    EnvService,
    {
      provide: MailSender,
      useClass: SendGridService
    },
  ],
  exports: [
    MailSender,
  ]
})
export class MailModule {}