import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PushNotificationSender } from "@/domain/notification/application/application/push-notification-sender";
import { SubscriptionsRepository } from "@/domain/subscriptions/applications/repositories/subscription-repository";
import { NotificationsRepository } from "@/domain/users/application/repositories/notification-repository";
import { UsersRepository } from "@/domain/users/application/repositories/user-repository";
import { Notification } from "@/domain/users/enterprise/notification";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class SubscriptionCronService {
  constructor(
    private usersRepository: UsersRepository,
    private subscriptionsRepository: SubscriptionsRepository,
    private readonly notificationRepository: NotificationsRepository,
    private readonly pushNotificationSender: PushNotificationSender
  ) {}

  //validate expired service provider subscription plan finish
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendNotificationToServiceProviderToday() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const subscriptions =
      await this.subscriptionsRepository.findSubscriptionEndIn({
        from: today,
        to: tomorrow,
      });

    for (let i = 0; i < subscriptions.length; i++) {
      const user = await this.usersRepository.findProfileBy({
        parentId: subscriptions[i].serviceProviderId.toString(),
        accountType: "ServiceProvider",
      });

      if (!user) continue;

      const notificationServiceProvider = Notification.create({
        description:
          "Sua subscrição está programada para expirar hoje. Renove agora para continuar aproveitando dos nossos serviços!",
        descriptionEn:
          "Your subscription is scheduled to expire today. Renew now to continue enjoying our services!",
        parentId: subscriptions[i].id.toString(),
        readed: false,
        title: "Sua Subscrição Expirou Hoje!",
        titleEn: "Your Subscription Expired Today!",
        type: "SubscriptionAboutExpire",
        userId: new UniqueEntityID(user?.id + ""),
      });
      await this.notificationRepository.create(notificationServiceProvider);

      this.pushNotificationSender.send({
        title: "Sua Subscrição Expirou Hoje!",
        description:
          "Sua subscrição está programada para expirar hoje. Renove agora para continuar aproveitando dos nossos serviços!",
        notificationToken: user.notificationToken,

        redirectTo: "SubscriptionAboutExpire",
      });
    }
  }

  //send notification to service provider 2 days before
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendNotificationToServiceProviderTwoDaysBefore() {
    const subscriptions =
      await this.subscriptionsRepository.findSubscriptionEndIn({
        from: new Date(),
        to: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
      });

    for (let i = 0; i < subscriptions.length; i++) {
      const user = await this.usersRepository.findProfileBy({
        parentId: subscriptions[i].serviceProviderId.toString(),
        accountType: "ServiceProvider",
      });

      if (!user) continue;

      const notificationServiceProvider = Notification.create({
        description:
          "Sua subscrição está programada para expirar em dois dias. Renove agora para continuar aproveitando dos nossos serviços!",
        descriptionEn:
          "Your subscription is scheduled to expire in two days. Renew now to continue enjoying our services!",
        parentId: subscriptions[i].id.toString(),
        readed: false,
        title: "Sua Subscrição Está Prestes a Expirar!",
        titleEn: "Your Subscription Is About to Expire!",
        type: "SubscriptionAboutExpire",
        userId: new UniqueEntityID(user?.id + ""),
      });
      await this.notificationRepository.create(notificationServiceProvider);

      this.pushNotificationSender.send({
        title: "Sua Subscrição Está Prestes a Expirar!",
        description:
          "Sua subscrição está programada para expirar em dois dias. Renove agora para continuar aproveitando dos nossos serviços!",
        notificationToken: user.notificationToken,

        redirectTo: "SubscriptionAboutExpire",
      });
    }
  }
}
