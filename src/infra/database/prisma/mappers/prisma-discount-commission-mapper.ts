import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { DiscountCommission } from "@/domain/subscriptions/enterprise/discount-commission";
import { DiscountCommission as PrismaDiscountCommission } from "@prisma/client";

export class PrismaDiscountCommissionMapper {
  static toDomain(info: PrismaDiscountCommission): DiscountCommission {
    return DiscountCommission.create({
      commission: info.commission,
      maxValue: info.maxValue,
      minValue: info.minValue,
      planId: new UniqueEntityID(info.planId),
      updatedAt: new Date(),
      status: info.status
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(discountCommission: DiscountCommission): PrismaDiscountCommission {
    return {
      id: discountCommission.id.toString(),
      commission: discountCommission.commission,
      maxValue: discountCommission.maxValue,
      minValue: discountCommission.minValue,
      planId: discountCommission.planId.toString(),
      status: discountCommission.status
    };
  }
}