import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ReviewAndRatingProps {
  stars: number
  comment: string
  reviewerId: UniqueEntityID
  userId: UniqueEntityID
  bookingId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class ReviewAndRating extends Entity<ReviewAndRatingProps> {
  get stars() {
    return this.props.stars;
  }
  get comment() {
    return this.props.comment;
  }
  get reviewerId() {
    return this.props.reviewerId;
  }
  get userId() {
    return this.props.userId;
  }
  get bookingId() {
    return this.props.bookingId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<ReviewAndRatingProps, "createdAt">, id?: UniqueEntityID) {
    const reviewAndRating = new ReviewAndRating({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return reviewAndRating;
  }
}
