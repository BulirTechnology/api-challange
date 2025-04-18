import { PaginationParams } from "@/core/repositories/pagination-params";
import { ReviewAndRating } from "../../enterprise/review-and-rating";

export abstract class ReviewAndRatingRepository {
  abstract findMany(params: PaginationParams): Promise<ReviewAndRating[]>
  abstract findById(id: string): Promise<ReviewAndRating | null>
  abstract create(answer: ReviewAndRating): Promise<void>
  abstract findReviews(params: { userId: string, bookingId: string, reviewerId: string }): Promise<ReviewAndRating | null>
}
