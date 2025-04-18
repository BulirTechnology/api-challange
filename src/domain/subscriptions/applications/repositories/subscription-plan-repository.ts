import { Pagination } from "@/core/repositories/pagination-params";
import { SubscriptionPlan } from "../../enterprise";

export abstract class SubscriptionPlanRepository {
  abstract findMany(params: {
    perPage?: number,
    page: number,
    status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ALL"
  }): Promise<Pagination<SubscriptionPlan>>
  abstract findByName(name: string): Promise<SubscriptionPlan | null>
  abstract findById(planId: string): Promise<SubscriptionPlan | null>
  abstract findDefaultPlan(): Promise<SubscriptionPlan | null>
  abstract create(plan: SubscriptionPlan): Promise<SubscriptionPlan>
  abstract publish(params: { subscriptionPlanId: string }): Promise<void>
}
