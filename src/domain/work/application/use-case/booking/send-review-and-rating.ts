import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository,
} from "@/domain/users/application/repositories";
import { ReviewAndRating } from "@/domain/work/enterprise/review-and-rating";

import {
  BookingsRepository,
  ReviewAndRatingRepository
} from "../../repositories";
import { AccountType, LanguageSlug } from "@/domain/users/enterprise";
import { Booking } from "@/domain/work/enterprise";

interface SendReviewAndRatingRequest {
  language: LanguageSlug;
  userId: string;
  bookingId: string;
  stars: number;
  feedback: string;
}

type SendReviewAndRatingResponse = Either<
  ResourceNotFoundError,
  null
>;

@Injectable()
export class SendReviewAndRatingUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private bookingsRepository: BookingsRepository,
    private reviewAndRatingRepository: ReviewAndRatingRepository
  ) { }

  async execute({
    bookingId,
    stars,
    feedback,
    userId
  }: SendReviewAndRatingRequest): Promise<SendReviewAndRatingResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      return left(new ResourceNotFoundError("Booking not found"));
    }

    const reviewerId = await this.getReviewerId(user.accountType, booking);
    if (!reviewerId) {
      return left(new ResourceNotFoundError("Reviewer not found"));
    }

    const reviewAndRating = ReviewAndRating.create({
      bookingId: booking.id,
      comment: feedback,
      reviewerId: new UniqueEntityID(reviewerId),
      userId: new UniqueEntityID(userId),
      stars,
    });

    await this.reviewAndRatingRepository.create(reviewAndRating);

    return right(null);
  }

  private async getReviewerId(accountType: AccountType, booking: Booking): Promise<string | null> {
    if (accountType === "Client") {
      const serviceProvider =
        await this.serviceProvidersRepository.findById(booking.serviceProviderId.toString());

      return serviceProvider ? serviceProvider.userId.toString() : null;
    } else if (accountType === "ServiceProvider") {
      const client = await this.clientsRepository.findById(booking.clientId.toString());

      return client ? client.userId.toString() : null;
    }

    return null;
  }
}
