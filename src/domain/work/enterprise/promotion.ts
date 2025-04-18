import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { AccountType } from "@/domain/users/enterprise/user";

export type PromotionType = "Percentage" | "Money"
export interface PromotionProps {
  name: string
  maxAllowedUser: number
  discount: number
  description: string
  descriptionEn: string
  promotionFor: AccountType
  promotionType: PromotionType
  status: "ACTIVE" | "INACTIVE"
  expiresAt: Date
  createdAt: Date
  updatedAt?: Date | null
}

export class Promotion extends Entity<PromotionProps> {
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get descriptionEn() {
    return this.props.descriptionEn;
  }
  get promotionType() {
    return this.props.promotionType;
  }
  get maxAllowedUser() {
    return this.props.maxAllowedUser;
  }
  get discount() {
    return this.props.discount;
  }
  get promotionFor() {
    return this.props.promotionFor;
  }
  get status() {
    return this.props.status;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<PromotionProps, "createdAt">, id?: UniqueEntityID) {
    const promotion = new Promotion({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return promotion;
  }
}
