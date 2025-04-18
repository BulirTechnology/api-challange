import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { DiscountCommissionRepository } from "@/domain/subscriptions/applications/repositories/discount-commission-repository";
import { DiscountCommission } from "@/domain/subscriptions/enterprise/discount-commission";
import { PrismaDiscountCommissionMapper } from "../mappers/prisma-discount-commission-mapper";

@Injectable()
export class PrismaDiscountCommissionRepository implements DiscountCommissionRepository {
  constructor(private prisma: PrismaService) { }
  async findMany(params: { page: number; planId?: string }): Promise<DiscountCommission[]> {
    const discounts = await this.prisma.discountCommission.findMany({
      where: {
        planId: params.planId ? {
          equals: params.planId
        } : {}
      }
    });

    return discounts.map(PrismaDiscountCommissionMapper.toDomain);
  }
  async create(plan: DiscountCommission): Promise<DiscountCommission> {
    const data = PrismaDiscountCommissionMapper.toPrisma(plan);

    const created = await this.prisma.discountCommission.create({
      data: {
        commission: data.commission,
        maxValue: data.maxValue,
        minValue: data.minValue,
        planId: data.planId,
        status: "DRAFT"
      }
    });

    return PrismaDiscountCommissionMapper.toDomain(created);
  }
  async publish(params: { subscriptionPlanId: string; }): Promise<void> {
    await this.prisma.discountCommission.updateMany({
      where: {
        planId: params.subscriptionPlanId
      },
      data: {
        status: "ACTIVE"
      }
    });
  }

}