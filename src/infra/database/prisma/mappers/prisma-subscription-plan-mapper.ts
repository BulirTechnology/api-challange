import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { SubscriptionPlan } from "@/domain/subscriptions/enterprise/subscription-plan";
import { SubscriptionPlan as PrismaSubscriptionPlans } from "@prisma/client";

export class PrismaSubscriptionPlanMapper {
  static toDomain(info: PrismaSubscriptionPlans): SubscriptionPlan {
    return SubscriptionPlan.create({
      creditsPerJob: info.creditsPerJob,
      description: info.description,
      discountType: info.discountType,
      discountValue: info.discountValue ? info.discountValue : 0,
      duration: info.duration,
      name: info.name,
      price: info.price,
      status: info.status,
      benefits: info.benefits,
      isDefault: info.isDefault,
      rollOverCredit: info.rollOverCredit,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(plan: SubscriptionPlan): PrismaSubscriptionPlans {
    return {
      id: plan.id.toString(),
      creditsPerJob: plan.creditsPerJob,
      description: plan.description,
      discountType: plan.discountType,
      discountValue: plan.discountValue,
      duration: plan.duration,
      name: plan.name,
      price: plan.price,
      status: plan.status,
      rollOverCredit: plan.rollOverCredit,
      isDefault: plan.isDefault,
      benefits: plan.benefits,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }
}