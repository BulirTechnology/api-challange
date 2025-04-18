import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { SubscriptionsRepository } from "@/domain/subscriptions/applications/repositories/subscription-repository";
import { Subscription } from "@/domain/subscriptions/enterprise/subscription";
import { PrismaSubscriptionMapper } from "../mappers/prisma-subscription-mapper";

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionsRepository {
  constructor(private prisma: PrismaService) { }

  async hasSpWithThisSubscription(params: { serviceProviderId: string; planId: string; }): Promise<boolean> {
    const total = await this.prisma.subscription.count({
      where: {
        serviceProviderId: params.serviceProviderId,
        status: "ACTIVE",
        subscriptionPlanId: params.planId
      }
    });

    return total > 0;
  }

  async findSubscriptionEndIn(params: { from: Date, to: Date }): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        endDate: {
          gte: params.from,
          lt: params.to
        }
      }
    });

    return subscriptions.map(PrismaSubscriptionMapper.toDomain);
  }

  async findActiveSubscription(params: { serviceProviderId: string; }): Promise<Subscription | null> {
    const subscriptionItem = await this.prisma.subscription.findFirst({
      where: {
        serviceProviderId: params.serviceProviderId,
        status: "ACTIVE",
      }
    });

    if (!subscriptionItem) return null;

    return PrismaSubscriptionMapper.toDomain(subscriptionItem);
  }

  async hasSpActiveSubscription(params: { serviceProviderId: string; }): Promise<boolean> {
    const total = await this.prisma.subscription.count({
      where: {
        serviceProviderId: params.serviceProviderId,
        status: "ACTIVE"
      }
    });

    return total > 0;
  }
  async findMany(params: { page: number; status: "ACTIVE" | "INACTIVE" | "CANCELLED" | "ALL"; }): Promise<Subscription[]> {
    const result = await this.prisma.subscription.findMany({
      where: {
        status: params.status && params.status != "ALL" ? {
          equals: params.status
        } : {}
      }
    });

    return result.map(PrismaSubscriptionMapper.toDomain);
  }
  async create(subscription: Subscription): Promise<Subscription> {
    const data = PrismaSubscriptionMapper.toPrisma(subscription);

    await this.prisma.subscription.updateMany({
      data: {
        status: 'INACTIVE',
        endDate: new Date(),
      },
      where: {
        serviceProviderId: subscription.serviceProviderId.toString(),
        status: 'ACTIVE'
      }
    })

    const created = await this.prisma.subscription.create({
      data: data
    });

    return PrismaSubscriptionMapper.toDomain(created);
  }

}