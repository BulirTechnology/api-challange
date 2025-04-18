import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Subscription } from "@/domain/subscriptions/enterprise/subscription";
import { Subscription as PrismaSubscription } from "@prisma/client";

export class PrismaSubscriptionMapper {
  static toDomain(info: PrismaSubscription): Subscription {
    return Subscription.create({
      endDate: info.endDate,
      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
      startDate: info.startDate,
      status: info.status,
      subscriptionPlanId: new UniqueEntityID(info.subscriptionPlanId),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(subscription: Subscription): PrismaSubscription {
    return {
      id: subscription.id.toString(),
      endDate: subscription.endDate,
      serviceProviderId: subscription.serviceProviderId.toString(),
      startDate:subscription.startDate,
      status: subscription.status,
      subscriptionPlanId: subscription.subscriptionPlanId.toString(),
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    };
  }
}