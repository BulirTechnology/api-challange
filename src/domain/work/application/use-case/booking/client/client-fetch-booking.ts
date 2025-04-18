import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";

import { BookingsRepository } from "../../../repositories";

import { Booking } from "@/domain/work/enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";

import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientBookingsUseCaseRequest {
  language: LanguageSlug
  userId: string
  page: number
  perPage?: number
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "EXPIRED" | "DISPUTE" | ""
}

type FetchClientBookingsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    bookings: Booking[]
    meta: MetaPagination
    information: {
      pending: number
      active: number
      completed: number
      expired: number
      inDispute: number
    }
  }
>

@Injectable()
export class FetchClientBookingsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private bookingsRepository: BookingsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    userId,
    status,
    perPage
  }: FetchClientBookingsUseCaseRequest): Promise<FetchClientBookingsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const bookings = await this.bookingsRepository.findClientBooking({
      page,
      clientId: client.id.toString(),
      status: status === "" ? undefined : status,
      perPage
    });

    const countBookingByState = await this.bookingsRepository.getWorkRequestCountsByState({
      parentId: client.id.toString(),
      accountType: "Client"
    })

    return right({
      bookings: bookings.data,
      meta: bookings.meta,
      information: countBookingByState
    });
  }
}
