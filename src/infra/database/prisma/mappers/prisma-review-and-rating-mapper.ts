import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ReviewAndRating } from "@/domain/work/enterprise/review-and-rating";
import { ReviewAndRating as PrismaReviewAndRating } from "@prisma/client";

export class PrismaReviewAndRatingMapper {
  static toDomain(info: PrismaReviewAndRating): ReviewAndRating {
    return ReviewAndRating.create({
      bookingId: new UniqueEntityID(info.bookingId),
      comment: info.comment ? info.comment : "",
      reviewerId: new UniqueEntityID(info.reviewerId),
      userId: new UniqueEntityID(info.userId),
      stars: info.stars,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(reviewAndRating: ReviewAndRating): PrismaReviewAndRating {
    return {
      id: reviewAndRating.id.toString(),
      bookingId: reviewAndRating.bookingId.toString(),
      comment: reviewAndRating.comment,
      createdAt: reviewAndRating.createdAt,
      reviewerId: reviewAndRating.reviewerId.toString(),
      userId: reviewAndRating.userId.toString(),
      stars: reviewAndRating.stars,
      updatedAt: reviewAndRating.updatedAt ? reviewAndRating.updatedAt : new Date()
    };
  }
}