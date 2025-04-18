import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Booking } from "@/domain/work/enterprise/booking";

import {
  UsersRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { BookingsRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServiceProviderBookingDetailsUseCaseRequest {
  language: LanguageSlug
  userId: string
  bookingId: string
}

type FetchServiceProviderBookingDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    booking: Booking
  }
>

@Injectable()
export class FetchServiceProviderBookingDetailsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private bookingsRepository: BookingsRepository
  ) { }

  async execute({
    userId,
    bookingId,
  }: FetchServiceProviderBookingDetailsUseCaseRequest): Promise<FetchServiceProviderBookingDetailsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const booking = await this.bookingsRepository.findById(bookingId);

    if (booking?.serviceProviderId.toString() !== serviceProvider.id.toString()) {
      return left(new ResourceNotFoundError("You don´t have any booking related to this id"));
    }

    return right({
      booking
    });
  }
}
