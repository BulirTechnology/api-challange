import { ResourceNotFoundError } from "@/core/errors";
import { SubscriptionPlan } from "@/domain/subscriptions/enterprise";
import { SubscriptionPlanRepository, SubscriptionsRepository } from "../../../repositories";

export async function validateSubscriptionPlan({
  serviceProviderId,
  subscriptionPlan,
  subscriptionsPlanRepository,
  subscriptionsRepository,
}:
  {
    subscriptionPlan: SubscriptionPlan,
    serviceProviderId: string,
    subscriptionsRepository: SubscriptionsRepository,
    subscriptionsPlanRepository: SubscriptionPlanRepository
  }
) {
  if (!subscriptionPlan)
    return new ResourceNotFoundError("Subscription plan not found");
  if (subscriptionPlan.status !== "ACTIVE")
    return new ResourceNotFoundError("Invalid subscription plan");
  if (subscriptionPlan.isDefault)
    return new ResourceNotFoundError("You cannot buy a free plan");

  const activeSubscription =
    await subscriptionsRepository.findActiveSubscription({
      serviceProviderId: serviceProviderId.toString()
    });

  const currentActiveSubscriptionPlan = await subscriptionsPlanRepository.findById(activeSubscription?.id.toString() + '')
  if (activeSubscription && !currentActiveSubscriptionPlan?.isDefault)
    return new ResourceNotFoundError("You already have one active plan");

  return null;
}