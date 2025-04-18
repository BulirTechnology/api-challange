import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BookingsRepository } from "@/domain/work/application/repositories/booking-repository";
import { ClientsRepository } from "@/domain/users/application/repositories/client-repository";
import { ServiceProvidersRepository } from "@/domain/users/application/repositories/service-provider-repository";
import { NotificationsRepository } from "@/domain/users/application/repositories/notification-repository";
import { Notification } from "@/domain/users/enterprise/notification";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PushNotificationSender } from "@/domain/notification/application/application/push-notification-sender";

@Injectable()
export class BookingCronService {
  constructor(
    private readonly clientRepository: ClientsRepository,
    private readonly serviceProviderRepository: ServiceProvidersRepository,
    private readonly bookingsRepository: BookingsRepository,
    private readonly notificationRepository: NotificationsRepository,
    private readonly pushNotificationSender: PushNotificationSender
  ) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async bookingExpires() {
    const expiredBookings = await this.bookingsRepository.findExpiredByDate({
      startDate: new Date()
    });

    for (let i = 0; i < expiredBookings.data.length; i++) {
      const clientId = expiredBookings[i].clientId.toString();
      const serviceProviderId = expiredBookings[i].serviceProviderId.toString();

      await this.bookingsRepository.updateState(expiredBookings[i].id.toString(), "EXPIRED");

      const client = await this.clientRepository.findById(clientId);
      const notificationClient = Notification.create({
        description: "Seu pedido anterior expirou, mas estamos aqui para ajudar você a criar um novo e realizar seus projetos. Juntos, vamos transformar suas ideias em realidade!",
        descriptionEn: "Your previous order expired, but we're here to assist you in creating a new one and bringing your projects to life. Let's work together to turn your ideas into reality!",
        parentId: expiredBookings[i].id.toString(),
        readed: false,
        title: "Agenda Expirada",
        titleEn: "Expired Booking",
        type: "JobExpired",
        userId: new UniqueEntityID(client?.userId + ""),
      });

      const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);
      const notificationServiceProvider = Notification.create({
        description: "Seu pedido anterior expirou, mas estou aqui para ajudar você a encontrar o proximo serviço perfeito!",
        descriptionEn: "Your previous request has expired, but I'm here to help you find the next perfect service!",
        parentId: expiredBookings[i].id.toString(),
        readed: false,
        title: "Agenda Expirada",
        titleEn: "Expired Booking",
        type: "JobExpired",
        userId: new UniqueEntityID(serviceProvider?.userId + ""),
      });

      await this.notificationRepository.create(notificationClient);
      await this.notificationRepository.create(notificationServiceProvider);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async bookingStartIn60Seconds() {
    const currentTime = new Date();
    const sixtySecondsFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000);

    const next60Minutes = await this.bookingsRepository.findItemStartInNextDate({
      currentTime,
      secondsFromNow: sixtySecondsFromNow
    });

    for (let i = 0; i < next60Minutes.data.length; i++) {
      const clientId = next60Minutes[i].clientId.toString();
      const serviceProviderId = next60Minutes[i].serviceProviderId.toString();

      const client = await this.clientRepository.findById(clientId);
      const notificationClient = Notification.create({
        description: "Sua tarefa está prestes a começar! Prepare-se para colaborar ou revisar conforme necessário.",
        descriptionEn: "Your task is about to begin! Get ready to collaborate or review as needed.",
        parentId: next60Minutes[i].id.toString(),
        readed: false,
        title: "Tarefa Começará em 1 Hora!",
        titleEn: "Task Starting in 1 Hour!",
        type: "BookingStartIn1Hour",
        userId: new UniqueEntityID(client?.userId + ""),
      });

      const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);
      const notificationServiceProvider = Notification.create({
        description: "A tarefa que você aceitou está prestes a começar! Por favor, esteja pronto para iniciar o trabalho conforme combinado.",
        descriptionEn: "The task you accepted is about to begin! Please be ready to start the work as agreed.",
        parentId: next60Minutes[i].id.toString(),
        readed: false,
        title: "Tarefa Começará em 1 Hora!",
        titleEn: "Task Starting in 1 Hour!",
        type: "BookingStartIn1Hour",
        userId: new UniqueEntityID(serviceProvider?.userId + ""),
      });

      await this.notificationRepository.create(notificationClient);
      await this.notificationRepository.create(notificationServiceProvider);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async bookingStartIn15Seconds() {
    const currentTime = new Date();
    const secondsFromNow = new Date(currentTime.getTime() + 15 * 60 * 1000);

    const next15Minutes = await this.bookingsRepository.findItemStartInNextDate({
      currentTime,
      secondsFromNow: secondsFromNow
    });

    for (let i = 0; i < next15Minutes.data.length; i++) {
      const clientId = next15Minutes[i].clientId.toString();
      const serviceProviderId = next15Minutes[i].serviceProviderId.toString();

      const client = await this.clientRepository.findById(clientId);
      const notificationClient = Notification.create({
        description: "Sua tarefa está prestes a começar! Prepare-se para colaborar ou revisar conforme necessário.",
        descriptionEn: "Your task is about to begin! Get ready to collaborate or review as needed.",
        parentId: next15Minutes[i].id.toString(),
        readed: false,
        title: "Tarefa Começará em 1 Hora!",
        titleEn: "Task Starting in 1 Hour!",
        type: "BookingStartIn15Minutes",
        userId: new UniqueEntityID(client?.userId + ""),
      });

      const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);
      const notificationServiceProvider = Notification.create({
        description: "A tarefa que você aceitou está prestes a começar! Por favor, esteja pronto para iniciar o trabalho conforme combinado.",
        descriptionEn: "The task you accepted is about to begin! Please be ready to start the work as agreed.",
        parentId: next15Minutes[i].id.toString(),
        readed: false,
        title: "Tarefa Começará em 15 minutos!",
        titleEn: "Task Starting in 1 minutes!",
        type: "BookingStartIn15Minutes",
        userId: new UniqueEntityID(serviceProvider?.userId + ""),
      });

      await this.notificationRepository.create(notificationClient);
      await this.notificationRepository.create(notificationServiceProvider);
    }
  }

  //auto approval bookings
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async bookingAutoApproval() {

  }
}
