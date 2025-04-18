
import { SMSSender } from "@/domain/users/application/sms/sms-sender";
import { Injectable } from "@nestjs/common";
/* import axios from "axios"; */

import sgMail from "@sendgrid/mail";
import { resolve } from "node:path";
import fs from "node:fs";
import handlebars from "handlebars";

import { EnvService } from "../environment/env.service";

@Injectable()
export class MimoSMSSender implements
  SMSSender {
  constructor(private env: EnvService) { }

  async send(data: {
    to: string;
    email?: string,
    body: unknown;
  }): Promise<void> {
    const accessToken = "4c448f0bb1218fdadc65a040c1849f18945029898";
    console.log(accessToken, data);
    /* try {
      await axios.post(`http://52.30.114.86:8080/mimosms/v1/message/send?token=${accessToken}`, {
        sender: "945029898",
        recipients: data.to,
        text: data.body
      });
    } catch(err) {
      console.log("error: ", err);
    } */

    const templatePath = resolve(
      __dirname,
      "..",
      "..",
      "..",
      "support",
      "mail",
      "templates",
      "account-phone-verification.hbs"
    );
    const templateFileContent = fs.readFileSync(templatePath).toString("utf-8");

    const templateParse = handlebars.compile(templateFileContent);

    const templateHTML = templateParse({
      username: data.to,
      otpCode: data.body,
    });
    console.log("data: ", data.email);
    const msg = {
      to: data.email,
      from: "jmbengui@bulir.com",
      subject: "Phone OTP",
      html: templateHTML
    };

    sgMail.setApiKey(this.env.get("SEND_GRID_KEY"));
    sgMail.send(msg).then(res => console.log("success: ", res)).catch(err => console.log("deu error: ", err));
  }

}