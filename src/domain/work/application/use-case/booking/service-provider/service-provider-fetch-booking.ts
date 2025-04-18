import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  UsersRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { Booking } from "@/domain/work/enterprise/booking";

import { BookingsRepository } from "../../../repositories/booking-repository";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServiceProviderBookingsUseCaseRequest {
  language: LanguageSlug
  userId: string
  page: number
  perPage?: number
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "EXPIRED" | "DISPUTE"
}

type FetchServiceProviderBookingsUseCaseResponse = Either<
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
export class FetchServiceProviderBookingsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private bookingsRepository: BookingsRepository
  ) { }

  async execute({
    page,
    userId,
    status,
    perPage
  }: FetchServiceProviderBookingsUseCaseRequest): Promise<FetchServiceProviderBookingsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const bookings = await this.bookingsRepository.findServiceProviderBooking({
      page,
      serviceProviderId: serviceProvider.id.toString(),
      status,
      perPage
    });

    const countBookingByState = await this.bookingsRepository.getWorkRequestCountsByState({
      parentId: serviceProvider.id.toString(),
      accountType: "ServiceProvider"
    })

    return right({
      bookings: bookings.data,
      meta: bookings.meta,
      information: countBookingByState
    });
  }
}
