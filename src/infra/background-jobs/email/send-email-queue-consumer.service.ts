import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { QueueName } from "../queue.interface";
import { Job } from "bull";
import { MailSender } from "@/domain/users/application/mail/mail-sender";

type SendEmailConsumerProps = {
  name: string
  email: string
}

@Processor(QueueName.email)
export class SendEmailConsumerService {
  constructor(private readonly mailSender: MailSender) {}

  @Process(QueueName.email)
  async execute(job: Job<SendEmailConsumerProps>) {
    await this.mailSender.send({
      body: "Meu email",
      subject: "Test email",
      to: job.data.email,
      templateName: "email-verification.hbs",
      variable: {
        username: job.data.name,
        otpCode: "emailOTP.code",
      }
    });
  }

  @OnQueueActive()
  onActive(job: Job<SendEmailConsumerProps>) {
    console.log("Queue active: ", job.id);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job<SendEmailConsumerProps>) {
    console.log("Completed: ", job.id);
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job<SendEmailConsumerProps>) {
    console.log("Fail: ", job.id);
  }
}