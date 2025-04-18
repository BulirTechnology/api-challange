import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type DiscountCommissionStatus = "ACTIVE" | "DRAFT" | "INACTIVE"

export interface DiscountCommissionProps {
  planId: UniqueEntityID
  commission: number
  maxValue: number
  minValue: number
  status: DiscountCommissionStatus
  createdAt: Date
  updatedAt: Date
}

export class DiscountCommission extends Entity<DiscountCommissionProps> {
  get planId() {
    return this.props.planId;
  }
  get commission() {
    return this.props.commission;
  }
  get status() {
    return this.props.status;
  }
  get maxValue() {
    return this.props.maxValue;
  }
  get minValue() {
    return this.props.minValue;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<DiscountCommissionProps, "createdAt">, id?: UniqueEntityID) {
    const discountCommission = new DiscountCommission({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return discountCommission;
  }
}
