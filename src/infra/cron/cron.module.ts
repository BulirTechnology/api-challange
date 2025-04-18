import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { NotificationModule } from "../notification/notification.module";

import { BookingCronService } from "./booking.cron.service";
import { PushNotificationCronService } from "./push-notification.cron.service";
import { PaymentCronService } from "./payment.cron.service";
import { SubscriptionCronService } from "./subscription.cron.service";

@Module({
  imports: [
    DatabaseModule,
    NotificationModule
  ],
  providers: [
    BookingCronService,
    PushNotificationCronService,
    PaymentCronService,
    SubscriptionCronService
  ]
})
export class CronModule { }