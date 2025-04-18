import { PushNotificationProps } from "../params/notification";

export abstract class PushNotificationSender {
  abstract send(data: PushNotificationProps): Promise<boolean>
}