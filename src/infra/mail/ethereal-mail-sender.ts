
import { MailSender } from "@/domain/users/application/mail/mail-sender";
import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import { resolve } from "path";

@Injectable()
export class EtherealMailSender implements
  MailSender {
  async createItem() {
    const response = await nodemailer.createTestAccount();

    return response;
  }
  async send(data: { to: string; body: unknown; }): Promise<void> {
    const client = await this.createItem();

    const transporter = nodemailer.createTransport({
      host: client.smtp.host,
      port: client.smtp.port,
      secure: client.smtp.secure,
      auth: {
        user: client.user,
        pass: client.pass
      }
    });
    // resolve from path
    const templatePath = resolve(__dirname, "..", "..", "..", "support", "mail", "templates", "email-verification.hbs");
    const templateFileContent = fs.readFileSync(templatePath).toString("utf-8");

    const templateParse = handlebars.compile(templateFileContent);
    const variable = {
      username: "Joel Mbengui",
      otpCode: "123"
    };
    const templateHTML = templateParse(variable);

    const message = await transporter.sendMail({
      to: data.to,
      from: "Bulir <noreplay@bulir.com",
      subject: "Criar de conta",
      html: templateHTML
    });

    console.log("message: ", message);
    console.log("MessageId: ", message.messageId);
    console.log("Preview: ", nodemailer.getTestMessageUrl(message));
  }

}