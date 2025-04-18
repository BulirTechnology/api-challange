import { ReviewAndRating } from "@/domain/work/enterprise/review-and-rating";

export class ReviewAndRatingPresenter {
  static toHTTP(reviewAndRating: ReviewAndRating) {
    return {
      id: reviewAndRating.id.toString(),
      comment: reviewAndRating.comment,
      stars: reviewAndRating.stars,
      reviewerId: reviewAndRating.reviewerId.toString(),
      userId: reviewAndRating.userId,
      created_at: reviewAndRating.createdAt,
      updated_at: reviewAndRating.updatedAt
    };
  }
}