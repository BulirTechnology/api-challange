import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { SubscriptionPlanRepository } from "@/domain/subscriptions/applications/repositories/subscription-plan-repository";
import { SubscriptionPlan } from "@/domain/subscriptions/enterprise/subscription-plan";
import { PrismaSubscriptionPlanMapper } from "../mappers/prisma-subscription-plan-mapper";
import { Pagination } from "@/core/repositories/pagination-params";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Prisma, SubscriptionPlan as PrismaSubscriptionPlans } from "@prisma/client";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaSubscriptionPlanRepository implements SubscriptionPlanRepository {
  constructor(private prisma: PrismaService) { }

  async findByName(name: string): Promise<SubscriptionPlan | null> {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: {
        name
      }
    });

    if (!plan) return null;

    return PrismaSubscriptionPlanMapper.toDomain(plan);
  }

  async findDefaultPlan(): Promise<SubscriptionPlan | null> {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: {
        isDefault: true
      }
    });

    if (!plan) return null;

    return PrismaSubscriptionPlanMapper.toDomain(plan);
  }
  async findById(planId: string): Promise<SubscriptionPlan | null> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: {
        id: planId
      }
    });

    if (!plan) return null;

    return PrismaSubscriptionPlanMapper.toDomain(plan);
  }
  async publish(params: { subscriptionPlanId: string; }): Promise<void> {
    await this.prisma.subscriptionPlan.update({
      where: {
        id: params.subscriptionPlanId
      },
      data: {
        status: "ACTIVE"
      }
    });
  }
  async findMany(params: {
    page: number,
    perPage?: number,
    status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ALL"
  }): Promise<Pagination<SubscriptionPlan>> {
    const page = 1;

    const response = await this.paginate({
      where: {
        status: params.status != "ALL" ? {
          equals: params.status
        } : {}
      },
      page,
      perPage: params.perPage,
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      data: response.data.map(PrismaSubscriptionPlanMapper.toDomain),
      meta: response.meta
    };
  }
  async create(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    const info = PrismaSubscriptionPlanMapper.toPrisma(plan);

    const data = await this.prisma.subscriptionPlan.create({
      data: info
    });

    return PrismaSubscriptionPlanMapper.toDomain(data);
  }
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.SubscriptionPlanWhereInput,
    orderBy?: Prisma.SubscriptionPlanOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaSubscriptionPlans>> {
    return paginate(
      this.prisma.subscriptionPlan,
      {
        where,
        orderBy,
      },
      {
        page,
        perPage,
      },
    );
  }
}