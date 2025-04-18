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
  PushNotificationRepository,
} from "@/domain/users/application/repositories";

import { BookingsRepository } from "../../../repositories";

import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface DenyToFinishBookingUseCaseRequest {
  language: LanguageSlug;
  userId: string;
  bookingId: string;
}

type DenyToFinishBookingUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string;
  }
>;

@Injectable()
export class DenyToFinishBookingUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private readonly i18n: I18nService,
    private serviceProviderRepository: ServiceProvidersRepository,
    private notificationRepository: NotificationsRepository,
    private pushNotificationRepository: PushNotificationRepository
  ) {}

  async execute({
    bookingId,
    userId,
  }: DenyToFinishBookingUseCaseRequest): Promise<DenyToFinishBookingUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(
        new ResourceNotFoundError(
          processI18nMessage(this.i18n, "errors.user.not_found")
        )
      );
    }

    const client = await this.clientsRepository.findByEmail(user.email);

    if (!client) {
      return left(
        new ResourceNotFoundError(
          processI18nMessage(this.i18n, "errors.user.client_not_found")
        )
      );
    }

    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      return left(
        new ResourceNotFoundError(
          processI18nMessage(this.i18n, "errors.booking.not_found")
        )
      );
    }

    if (booking.clientId.toString() != client.id.toString()) {
      return left(
        new ResourceNotFoundError(
          processI18nMessage(this.i18n, "errors.booking.not_found")
        )
      );
    }

    if (booking.requestWorkState === "REQUEST_FINISH_DENIED") {
      return right({
        message: processI18nMessage(this.i18n, "errors.booking.deny_to_finish"),
      });
    }

    await this.bookingsRepository.updateRequestWorkState(
      bookingId,
      "REQUEST_FINISH_DENIED"
    );

    const serviceProvider = await this.serviceProviderRepository.findById(
      booking.serviceProviderId.toString()
    );

    await createNotificationRegister({
      descriptionPt: "O seu pedido para finalizar o serviço foi rejeitado",
      descriptionEn: "Your request to complete the service was rejected ",
      parentId: booking.id.toString(),
      titlePt: "Pedido para finalizar o serviço rejeitado",
      titleEn: "Request to complete the job denied",
      type: "RequestToCompleteJobDenied",
      userId: new UniqueEntityID(serviceProvider?.userId + ""),
      language: "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: "BOOKINGDETAILS",
      pushNotificationRepository: this.pushNotificationRepository,
    });

    return right({
      message: processI18nMessage(this.i18n, "errors.booking.deny_to_finish"),
    });
  }
}
