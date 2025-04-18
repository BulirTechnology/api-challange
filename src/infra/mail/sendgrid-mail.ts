import { Injectable } from "@nestjs/common";
import sgMail from "@sendgrid/mail";
import { resolve } from "node:path";
import fs from "node:fs";
import handlebars from "handlebars";

import { EnvService } from "../environment/env.service";
import { MailSender } from "@/domain/users/application/mail/mail-sender";

@Injectable()
export class SendGridService implements MailSender {

  constructor(
    private env: EnvService
  ) {
  }
  async send(data: {
    to: string;
    subject: string;
    body: unknown;
    templateName?: string
    variable: unknown
  }): Promise<void> {
    const templatePath = resolve(
      __dirname,
      "..",
      "..",
      "..",
      "support",
      "mail",
      "templates",
      data.templateName?.toString() + ""
    );
    const templateFileContent = fs.readFileSync(templatePath).toString("utf-8");

    const templateParse = handlebars.compile(templateFileContent);

    const templateHTML = templateParse(data.variable);

    const msg = {
      to: data.to,
      from: "jmbengui@bulir.com",
      subject: data.subject,
      html: templateHTML
    };

    sgMail.setApiKey(this.env.get("SEND_GRID_KEY"));
    sgMail.send(msg).then(res => console.log("success: ", res)).catch(err => console.log("deu error: ", err));
  }
}