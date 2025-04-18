import { PushNotificationSender } from "@/domain/notification/application/application/push-notification-sender";
import { NotificationsRepository } from "@/domain/users/application/repositories/notification-repository";
import { UsersRepository } from "@/domain/users/application/repositories/user-repository";
import { BookingsRepository } from "@/domain/work/application/repositories/booking-repository";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class PaymentCronService {
  constructor(
    private usersRepository: UsersRepository,
    private readonly notificationRepository: NotificationsRepository,
    private readonly pushNotificationSender: PushNotificationSender,
    private readonly bookingsRepository: BookingsRepository
  ) {}
  //validate for pending payment of jobs after 3 days
  // ENCONTRAR PAGAMENTOS DE BOOKINGS QUE TERMINARAM A 3 DIAS ATRAZ E NÃO TÊM DISPUTE
  // E ESTAO COMO COMPLETED
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async processBookingPayment() {
    const today = new Date();
    const threeDayBefore = new Date(today);
    threeDayBefore.setDate(today.getDate() - 3);

    const bookings = await this.bookingsRepository.findByState({
      state: "COMPLETED",
      date: threeDayBefore,
    });

    for (let i = 0; i < bookings.length; i++) {}
  }
}
