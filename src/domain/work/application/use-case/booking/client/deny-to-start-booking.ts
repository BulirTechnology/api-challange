import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository,
  NotificationsRepository,
  PushNotificationRepository
} from "@/domain/users/application/repositories";

import { LanguageSlug } from "@/domain/users/enterprise";

import { BookingsRepository } from "../../../repositories";

import { SocketGateway } from "@/infra/websocket/socket.gateway";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface DenyToStartBookingUseCaseRequest {
  language: LanguageSlug
  userId: string,
  bookingId: string
}

type DenyToStartBookingUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class DenyToStartBookingUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private notificationRepository: NotificationsRepository,
    private readonly i18n: I18nService,
    private readonly socketGateway: SocketGateway,
    private pushNotificationRepository: PushNotificationRepository
  ) { }

  async execute({
    bookingId,
    userId
  }: DenyToStartBookingUseCaseRequest): Promise<DenyToStartBookingUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientsRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.booking.not_found")));
    }

    if (booking.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.booking.not_found")));
    }

    if (booking.requestWorkState === "REQUEST_START_DENIED") {
      return right({
        message: processI18nMessage(this.i18n, "errors.booking.deny_to_start")
      });
    }

    await this.bookingsRepository.updateRequestWorkState(bookingId, "REQUEST_START_DENIED");

    const serviceProvider = await this.serviceProviderRepository.findById(booking.serviceProviderId.toString());
    const userSp = await this.userRepository.findById(serviceProvider?.userId.toString() + "");

    await createNotificationRegister({
      descriptionPt: "O seu pedido para começar a realizar o serviço foi rejeitado ",
      descriptionEn: "Your request to start the service was rejected",
      parentId: booking.id.toString(),
      titlePt: "Pedido de início de serviço rejeitado",
      titleEn: "Request to start job denied",
      type: "RequestToStartJobDenied",
      userId: new UniqueEntityID(serviceProvider?.userId + ""),
      language: "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: "BOOKINGDETAILS",
      pushNotificationRepository: this.pushNotificationRepository
    })

    this.socketGateway.notifySpClientDenieStartBooking({
      bookingId: booking.id.toString(),
      socketId: `${userSp?.socketId}`
    });

    return right({
      message: processI18nMessage(this.i18n, "errors.booking.deny_to_start")
    });
  }
}
