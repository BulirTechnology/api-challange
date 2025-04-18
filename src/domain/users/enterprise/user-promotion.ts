import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { PromotionType } from "@/domain/work/enterprise/promotion";
 
export type UserPromotionState = "PENDING" | "USED"

export interface UserPromotionProps {
  name?: string | null
  discount: number
  description?: string | null
  userId: string
  promotionId: string
  state: UserPromotionState
  promotionType?: PromotionType
  expiresAt?: Date | null
  createdAt: Date
  updatedAt?: Date | null
}

export class UserPromotion extends Entity<UserPromotionProps> {
  get userId() {
    return this.props.userId;
  }
  get promotionType() {
    return this.props.promotionType;
  }
  get promotionId() {
    return this.props.promotionId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.createdAt;
  }
  get state() {
    return this.props.state;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }
  get name() {
    return this.props.name;
  }
  get discount() {
    return this.props.discount;
  }
  get description() {
    return this.props.description;
  }

  static create(props: Optional<UserPromotionProps, "state" | "createdAt" | "promotionType">, id?: UniqueEntityID) {
    const user = new UserPromotion({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      state: props.state ? "PENDING" : "USED",
    }, id);

    return user;
  }
}
