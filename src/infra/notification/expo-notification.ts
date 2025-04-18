import { PushNotificationSender } from "@/domain/notification/application/application/push-notification-sender";
import { PushNotificationProps } from "@/domain/notification/application/params/notification";
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class ExpoNotificationService implements PushNotificationSender {
  async send(data: PushNotificationProps): Promise<boolean> {
    try {
      if (!data.notificationToken) return false;

      await axios.post("https://exp.host/--/api/v2/push/send", {
        to: data.notificationToken,
        title: data.title,
        body: data.description,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
