import { Subscription } from "../../enterprise";

export abstract class SubscriptionsRepository {
  abstract findMany(params: { page: number, status: "ACTIVE" | "INACTIVE" | "ALL" }): Promise<Subscription[]>
  abstract create(plan: Subscription): Promise<Subscription>
  abstract hasSpWithThisSubscription(params: {
    serviceProviderId: string
    planId: string
  }): Promise<boolean>
  abstract hasSpActiveSubscription(params: {
    serviceProviderId: string
  }): Promise<boolean>
  abstract findActiveSubscription(params: {
    serviceProviderId: string;
  }): Promise<Subscription | null>
  abstract findSubscriptionEndIn(params: { from: Date, to: Date }): Promise<Subscription[]>
}
