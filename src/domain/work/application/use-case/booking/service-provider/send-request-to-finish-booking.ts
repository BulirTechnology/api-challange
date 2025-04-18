import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  LanguageSlug
} from "@/domain/users/enterprise";

import {
  PushNotificationRepository,
  ServiceProvidersRepository,
  ClientsRepository,
  NotificationsRepository,
  UsersRepository
} from "@/domain/users/application/repositories";

import { BookingsRepository } from "../../../repositories";

import { SocketGateway } from "@/infra/websocket/socket.gateway";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface SendRequestToFinishBookingUseCaseRequest {
  language: LanguageSlug
  userId: string,
  bookingId: string
}

type SendRequestToFinishBookingUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SendRequestToFinishBookingUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private clientRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private readonly i18n: I18nService,
    private notificationRepository: NotificationsRepository,
    private pushNotificationRepository: PushNotificationRepository,
    private readonly socketGateway: SocketGateway
  ) { }

  async execute({
    bookingId,
    userId
  }: SendRequestToFinishBookingUseCaseRequest): Promise<SendRequestToFinishBookingUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));
    }

    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.booking.not_found")));
    }

    if (booking.serviceProviderId.toString() != serviceProvider.id.toString()) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.booking.not_found")));
    }

    if (
      booking.requestWorkState === "COMPLETED" ||
      booking.requestWorkState === "DISPUTE" ||
      booking.requestWorkState === "REQUEST_START" ||
      booking.requestWorkState === "REQUEST_START_DENIED" ||
      booking.requestWorkState === "UPCOMING"
    ) {
      return left(new ResourceNotFoundError("You can not request to finish a booking that is in: " + booking.requestWorkState));
    }

    if (booking.requestWorkState === "REQUEST_FINISH") {
      return right(null);
    }

    await this.bookingsRepository.updateRequestWorkState(bookingId, "REQUEST_FINISH");
    await this.bookingsRepository.increaseTotalTryingToFinish({
      bookingId,
      total: booking.totalTryingToFinish + 1
    });

    const client = await this.clientRepository.findById(booking.clientId.toString());
    const clientUser = await this.userRepository.findById(client?.userId.toString() + "");

    await createNotificationRegister({
      descriptionPt: "Foi enviado um pedido para finalizar a agenda",
      descriptionEn: "Was send a request to complete the service",
      parentId: booking.id.toString(),
      titlePt: "Pedido para finalizar a agenda",
      titleEn: "Request to complete booking",
      type: "RequestToCompleteJob",
      userId: new UniqueEntityID(client?.userId + ""),
      language: "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: "BOOKINGDETAILS",
      pushNotificationRepository: this.pushNotificationRepository
    })

    const totalRequestToStart = await this.bookingsRepository.getTotalRequestBookingByState({
      accountType: "Client",
      parentId: client?.id.toString() + '',
      requestWorkState: "REQUEST_START"
    })

    const totalRequestToFinish = await this.bookingsRepository.getTotalRequestBookingByState({
      accountType: "Client",
      parentId: client?.id.toString() + '',
      requestWorkState: "REQUEST_FINISH"
    })

    this.socketGateway.notifyClientSpWantToFinishBooking({
      bookingId: booking.id.toString(),
      totalRequestToFinish: totalRequestToFinish,
      totalRequestToStart: totalRequestToStart,
      socketId: `${clientUser?.socketId}`
    });

    return right(null);
  }
}
