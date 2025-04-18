import { I18nContext, I18nService } from "nestjs-i18n";
import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ServiceProvidersRepository,
  NotificationsRepository,
  ClientsRepository,
  PushNotificationRepository,
} from "@/domain/users/application/repositories";

import {
  LanguageSlug,
} from "@/domain/users/enterprise";

import { SocketGateway } from "@/infra/websocket/socket.gateway";
import { BookingsRepository } from "../../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface SendRequestToStartBookingUseCaseRequest {
  language: LanguageSlug
  userId: string,
  bookingId: string
}

type SendRequestToStartBookingUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SendRequestToStartBookingUseCase {
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
  }: SendRequestToStartBookingUseCaseRequest): Promise<SendRequestToStartBookingUseCaseResponse> {
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
      booking.requestWorkState === "RUNNING" ||
      booking.requestWorkState === "COMPLETED" ||
      booking.requestWorkState === "DISPUTE" ||
      booking.requestWorkState === "REQUEST_FINISH" ||
      booking.requestWorkState === "REQUEST_FINISH_DENIED"
    ) {
      return left(new ResourceNotFoundError("You can not request to start a booking that is in: " + booking.requestWorkState));
    }

    if (booking.requestWorkState === "REQUEST_START") {
      return right(null);
    }

    await this.bookingsRepository.updateRequestWorkState(bookingId, "REQUEST_START");
    await this.bookingsRepository.increaseTotalTryingToStart({
      bookingId,
      total: booking.totalTryingToStart + 1
    });

    const client = await this.clientRepository.findById(booking.clientId.toString());

    await createNotificationRegister({
      descriptionPt: "Foi enviado um pedido para começar a realizar o serviço",
      descriptionEn: "Was send a request to start the service",
      parentId: booking.id.toString(),
      titlePt: "Pedido de início de serviço",
      titleEn: "Request to start job",
      type: "RequestToStartJob",
      userId: new UniqueEntityID(client?.userId + ""),
      language: 'pt',
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: 'BOOKINGDETAILS',
      pushNotificationRepository: this.pushNotificationRepository
    })

    const clientUser = await this.userRepository.findById(client?.userId.toString() + "");

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

    this.socketGateway.notifyClientSpWantToStartBooking({
      bookingId: booking.id.toString(),
      totalRequestToFinish: totalRequestToFinish,
      totalRequestToStart: totalRequestToStart,
      socketId: `${clientUser?.socketId}`
    });

    return right(null);
  }
}
