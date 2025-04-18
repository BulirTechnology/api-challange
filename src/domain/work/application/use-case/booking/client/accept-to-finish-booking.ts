import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  NotificationsRepository,
  ClientsRepository,
  ServiceProvidersRepository,
  PushNotificationRepository
} from "@/domain/users/application/repositories";

import {
  LanguageSlug
} from "@/domain/users/enterprise";

import {
  BookingsRepository,
  ConversationsRepository
} from "../../../repositories/";

import { Conversation } from "@/domain/work/enterprise/conversation";

import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface AcceptToFinishBookingUseCaseRequest {
  language: LanguageSlug
  userId: string,
  bookingId: string
}

type AcceptToFinishBookingUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AcceptToFinishBookingUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private readonly i18n: I18nService,
    private serviceProviderRepository: ServiceProvidersRepository,
    private notificationRepository: NotificationsRepository,
    private conversationsRepository: ConversationsRepository,
    private pushNotificationRepository: PushNotificationRepository
  ) { }

  async execute({
    bookingId,
    userId
  }: AcceptToFinishBookingUseCaseRequest): Promise<AcceptToFinishBookingUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientsRepository.findByEmail(user.email);

    if (!client) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")
        ));
    }

    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.booking.not_found")));
    }

    if (booking.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError(
        processI18nMessage(this.i18n, "errors.booking.not_found")
      ));
    }

    if (booking.requestWorkState === "COMPLETED") {
      return right({
        message: processI18nMessage(this.i18n, "errors.booking.accept_to_finish")
      });
    }

    await this.bookingsRepository.updateState(bookingId, "COMPLETED");
    await this.bookingsRepository.updateRequestWorkState(bookingId, "COMPLETED");

    const serviceProvider = await this.serviceProviderRepository.findById(booking.serviceProviderId.toString());

    createNotificationRegister({
      descriptionPt: "O seu pedido para finalizar o serviço foi aceite",
      descriptionEn: "Your request to complete the service was accepted",
      parentId: booking.id.toString(),
      titlePt: "Pedido para finalizar o serviço aceite",
      titleEn: "Request to complete the job accepted",
      type: "RequestToCompleteJobAccepted",
      userId: new UniqueEntityID(serviceProvider?.userId + ""),
      language: "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: "BOOKINGDETAILS",
      pushNotificationRepository: this.pushNotificationRepository
    })

    const conversation = Conversation.create({
      bookingId: new UniqueEntityID(bookingId),
      messages: []
    });
    await this.conversationsRepository.create(conversation);

    return right({
      message: processI18nMessage(this.i18n, "errors.booking.accept_to_finish")
    });
  }
}
