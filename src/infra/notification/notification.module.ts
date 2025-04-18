import { Module } from "@nestjs/common";
import { PushNotificationSender } from "@/domain/notification/application/application/push-notification-sender";
import { ExpoNotificationService } from "./expo-notification";

@Module({
  providers: [
    {
      provide: PushNotificationSender,
      useClass: ExpoNotificationService,
    },
  ],
  exports: [PushNotificationSender],
})
export class NotificationModule {}
