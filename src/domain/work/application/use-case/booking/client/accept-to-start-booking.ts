import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

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

import { BookingsRepository } from "../../../repositories/booking-repository";

import {
  LanguageSlug
} from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface AcceptToStartBookingUseCaseRequest {
  language: LanguageSlug
  userId: string,
  bookingId: string
}

type AcceptToStartBookingUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AcceptToStartBookingUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private notificationRepository: NotificationsRepository,
    private readonly i18n: I18nService,
    private pushNotificationRepository: PushNotificationRepository
  ) { }

  async execute({
    bookingId,
    userId
  }: AcceptToStartBookingUseCaseRequest): Promise<AcceptToStartBookingUseCaseResponse> {
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
      return left(new ResourceNotFoundError("Booking not found."));
    }

    if (booking.requestWorkState === "RUNNING") {
      return right({
        message: processI18nMessage(this.i18n, "errors.booking.accept_to_start")
      });
    }

    await this.bookingsRepository.updateState(bookingId, "ACTIVE");
    await this.bookingsRepository.updateRequestWorkState(bookingId, "RUNNING");

    const serviceProvider = await this.serviceProviderRepository.findById(booking.serviceProviderId.toString());

    await createNotificationRegister({
      descriptionPt: "O seu pedido para começar a realizar o serviço foi aceite",
      descriptionEn: "Your request to start the service was accepted",
      parentId: booking.id.toString(),
      titlePt: "Pedido de início de serviço aceite",
      titleEn: "Request to start job accepted",
      type: "RequestToStartJobAccepted",
      userId: new UniqueEntityID(serviceProvider?.userId + ""),
      language: "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: 'BOOKINGDETAILS',
      pushNotificationRepository: this.pushNotificationRepository
    })

    return right({
      message: processI18nMessage(this.i18n, "errors.booking.accept_to_start")
    });
  }
}
