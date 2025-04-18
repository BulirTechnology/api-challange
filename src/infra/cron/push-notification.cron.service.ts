import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PushNotificationSender } from "@/domain/notification/application/application/push-notification-sender";
import { PushNotificationRepository } from "@/domain/users/application/repositories/push-notification-repository";

@Injectable()
export class PushNotificationCronService {
  constructor(
    private readonly pushNotificationRepository: PushNotificationRepository,
    private readonly pushNotificationSender: PushNotificationSender
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async pendingNotifications() {
    const notifications = await this.pushNotificationRepository.fetchPending();

    for (const element of notifications.data) {
      const notification = element;

      await this.pushNotificationSender.send({
        title: notification.title,
        description: notification.description,
        notificationToken: notification.notificationToken!,
        redirectTo: notification.redirectTo,
      });

      console.log("notification.id: ", notification.id);
      await this.pushNotificationRepository.delete(notification.id.toString());
    }
  }
}
