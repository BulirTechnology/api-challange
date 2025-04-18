import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type DiscountType = 
  "FIXED" |
  "TIERED"

export type SubscriptionPlanStatus = "ACTIVE" | "INACTIVE" | "DRAFT"

export interface SubscriptionPlanProps {
  name: string
  description: string
  price: number
  duration: number
  discountType: DiscountType
  rollOverCredit: number
  creditsPerJob: number
  discountValue: number
  benefits: string[]
  isDefault: boolean
  status: SubscriptionPlanStatus
  createdAt: Date
  updatedAt: Date
}

export class SubscriptionPlan extends Entity<SubscriptionPlanProps> {
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get isDefault() {
    return this.props.isDefault;
  }
  get price() {
    return this.props.price;
  }
  get duration() {
    return this.props.duration;
  }
  get benefits() {
    return this.props.benefits;
  }
  get rollOverCredit() {
    return this.props.rollOverCredit;
  }
  get discountType() {
    return this.props.discountType;
  }
  get creditsPerJob() {
    return this.props.creditsPerJob;
  }
  get discountValue() {
    return this.props.discountValue;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<SubscriptionPlanProps, "createdAt">, id?: UniqueEntityID) {
    const subscriptionPlan = new SubscriptionPlan({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return subscriptionPlan;
  }
}
