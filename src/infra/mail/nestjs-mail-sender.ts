import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendUserConfirmation(data: { to: string, token: string, name: string }) {
    const url = `example.com/auth/confirm?token=${data.token}`;

    await this.mailerService.sendMail({
      to: data.to,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: "Welcome to Nice App! Confirm your Email",
      template: "./confirmation", // `.hbs` extension is appended automatically
      context: {
        name: data.name,
        url,
      },
    });
  }
}
