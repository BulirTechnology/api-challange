import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  BookingsRepository,
  ReviewAndRatingRepository
} from "../../repositories";

import {
  UsersRepository,
  ServiceProvidersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

import { getBookingRelatedUserIds } from "./helper/get-booking-user-related-user";

interface FetchReviewAndRatingRequest {
  language: LanguageSlug;
  userId: string;
  bookingId: string;
}

type FetchReviewAndRatingResponse = Either<
  ResourceNotFoundError,
  {
    data: {
      serviceProvider: {
        stars: number;
        comment: string;
        createdAt: Date;
      };
      client: {
        stars: number;
        comment: string;
        createdAt: Date;
      };
    };
  }
>;

@Injectable()
export class FetchReviewAndRatingUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private bookingsRepository: BookingsRepository,
    private clientsRepository: ClientsRepository,
    private reviewAndRatingRepository: ReviewAndRatingRepository,
    private serviceProvidersRepository: ServiceProvidersRepository
  ) { }

  async execute({
    bookingId,
    userId,
  }: FetchReviewAndRatingRequest): Promise<FetchReviewAndRatingResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      return left(new ResourceNotFoundError("Booking not found"));
    }

    const { clientUserId, serviceProviderUserId } = await getBookingRelatedUserIds({
      booking,
      clientsRepository: this.clientsRepository,
      serviceProvidersRepository: this.serviceProvidersRepository
    });
    if (!clientUserId || !serviceProviderUserId) {
      return left(new ResourceNotFoundError("Related user not found"));
    }

    const clientReview = await this.reviewAndRatingRepository.findReviews({
      userId: clientUserId,
      bookingId,
      reviewerId: serviceProviderUserId
    });
    const serviceProviderReview = await this.reviewAndRatingRepository.findReviews({
      userId: serviceProviderUserId,
      bookingId,
      reviewerId: clientUserId
    });

    return right({
      data: {
        client: {
          comment: clientReview ? clientReview.comment : "",
          stars: clientReview ? clientReview.stars : 0,
          createdAt: clientReview ? clientReview.createdAt : new Date()
        },
        serviceProvider: {
          comment: serviceProviderReview ? serviceProviderReview.comment : "",
          stars: serviceProviderReview ? serviceProviderReview.stars : 0,
          createdAt: serviceProviderReview ? serviceProviderReview.createdAt : new Date()
        }
      }
    });
  }
}
