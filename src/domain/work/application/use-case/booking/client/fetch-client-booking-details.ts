import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { BookingsRepository } from "../../../repositories";

import { Booking } from "@/domain/work/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientBookingDetailsUseCaseRequest {
  userId: string
  bookingId: string
}

type FetchClientBookingDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    booking: Booking
  }
>

@Injectable()
export class FetchClientBookingDetailsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    bookingId
  }: FetchClientBookingDetailsUseCaseRequest): Promise<FetchClientBookingDetailsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const booking = await this.bookingsRepository.findById(bookingId);
    if (booking?.clientId.toString() !== client.id.toString()) {
      return left(new ResourceNotFoundError("Resource not found"))
    }

    return right({
      booking
    });
  }
}
