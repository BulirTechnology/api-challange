import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CreditPackage } from "@/domain/subscriptions/enterprise/credit-package";
import {
  CreditPackage as PrismaCreditPackage,
} from "@prisma/client";

export class PrismaCreditPackageMapper {
  static toDomain(info: PrismaCreditPackage): CreditPackage {
    return CreditPackage.create({
      amount: info.amount,
      name: info.name,
      status: info.status,
      totalCredit: info.totalCredit,
      vat: info.vat,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(creditPackage: CreditPackage): PrismaCreditPackage {
    return {
      id: creditPackage.id.toString(),
      amount: creditPackage.amount,
      name: creditPackage.name,
      status: creditPackage.status,
      totalCredit: creditPackage.totalCredit,
      createdAt: creditPackage.createdAt,
      updatedAt: creditPackage.updatedAt,
      vat: creditPackage.vat
    };
  }
}