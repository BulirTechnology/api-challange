import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "CANCELLED"

export interface SubscriptionProps {
  serviceProviderId: UniqueEntityID
  subscriptionPlanId: UniqueEntityID
  startDate: Date
  endDate: Date
  status: SubscriptionStatus
  createdAt: Date
  updatedAt: Date
}

export class Subscription extends Entity<SubscriptionProps> {
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get subscriptionPlanId() {
    return this.props.subscriptionPlanId;
  }
  get startDate() {
    return this.props.startDate;
  }
  get endDate() {
    return this.props.endDate;
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

  static create(props: Optional<SubscriptionProps, "createdAt">, id?: UniqueEntityID) {
    const subscriptionPlan = new Subscription({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return subscriptionPlan;
  }
}
