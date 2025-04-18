import { DiscountCommission } from "../../enterprise";

export abstract class DiscountCommissionRepository {
  abstract findMany(params: {
    page: number,
    subscriptionPlanId: string,
    perPage: number
  }): Promise<DiscountCommission[]>
  abstract create(plan: DiscountCommission): Promise<DiscountCommission>
  abstract publish(params: { subscriptionPlanId: string }): Promise<void>
}
