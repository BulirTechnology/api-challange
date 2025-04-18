import { SubscriptionPlan } from "@/domain/subscriptions/enterprise/subscription-plan";
import { ServiceProviderSubscriptionProps } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-service-provider-subscriptions";

export class SubscriptionPlanPresenter {
  static toHTTP(plan: SubscriptionPlan) {
    return {
      id: plan.id.toString(),
      credits_per_job: plan.creditsPerJob,
      description: plan.description,
      discount_type: plan.discountType,
      discount_value: plan.discountValue,
      duration: plan.duration,
      benefits: plan.benefits,
      name: plan.name,
      price: plan.price,
      status: plan.status,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt
    };
  }
}

export class ServiceProviderSubscriptionPresenter {
  static toHTTP(plan: ServiceProviderSubscriptionProps) {
    return {
      id: plan.id.toString(),
      credits_per_job: plan.creditsPerJob,
      description: plan.description,
      discount_type: plan.discountType,
      discount_value: plan.discountValue,
      duration: plan.duration,
      benefits: plan.benefits,
      name: plan.name,
      price: plan.price,
      is_active: plan.isActive 
    };
  }
}