import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { QueueName } from "./queue.interface";
import { SendEmailQueueService } from "./email/send-email-queue.service";
import { SendEmailConsumerService } from "./email/send-email-queue-consumer.service";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    MailModule,
    BullModule.registerQueue(
      {
        name: QueueName.email
      },
      {
        name: QueueName.audio
      },
    )
  ],
  providers: [
    SendEmailQueueService,
    SendEmailConsumerService
  ],
  exports: [SendEmailQueueService]
})
export class BackgroundJobsModule { }
