import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  FileDisputeRepository,
  BookingsRepository
} from "../../repositories";
import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";

import { Booking, FileDispute } from "@/domain/work/enterprise";
import { LanguageSlug, User } from "@/domain/users/enterprise";

interface FetchBookingFileDisputeUseCaseRequest {
  language: LanguageSlug
  userId: string
  bookingId: string
}

type FetchBookingFileDisputeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    dispute: FileDispute | null
  }
>

@Injectable()
export class FetchBookingFileDisputeUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private fileDisputeRepository: FileDisputeRepository,
    private bookingRepository: BookingsRepository
  ) { }

  async execute({
    bookingId,
    userId,
  }: FetchBookingFileDisputeUseCaseRequest): Promise<FetchBookingFileDisputeUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) return left(new ResourceNotFoundError("Account not found"));

    const userRelatedId = await this.getUserRelatedId(user);

    if (!userRelatedId) return left(new ResourceNotFoundError("Account not found"));

    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking || !this.isUserAssociatedWithBooking(user, userRelatedId, booking))
      return left(new ResourceNotFoundError("Booking reason not found"));

    const data = await this.fileDisputeRepository.findByBookingId(bookingId);

    return right({
      dispute: data,
    });
  }

  private async getUserRelatedId(user: User): Promise<string | null> {
    if (user.accountType === "Client") {
      const client = await this.clientRepository.findByEmail(user.email);
      return client ? client.id.toString() : null;
    } else if (user.accountType === "ServiceProvider") {
      const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);
      return serviceProvider ? serviceProvider.id.toString() : null;
    }
    return null;
  }

  private isUserAssociatedWithBooking(user: User, responseId: string, booking: Booking): boolean {
    if (user.accountType === "Client" && booking.clientId.toString() !== responseId) {
      return false;
    }
    if (user.accountType === "ServiceProvider" && booking.serviceProviderId.toString() !== responseId) {
      return false;
    }
    return true;
  }
}
