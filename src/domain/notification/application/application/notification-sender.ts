import { PushNotificationProps } from "../params/notification";

export abstract class NotificationSender {
  abstract send(data: PushNotificationProps): Promise<void>
}