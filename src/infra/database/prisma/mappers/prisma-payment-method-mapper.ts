import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PaymentMethod } from "@/domain/users/enterprise/payment-method";
import { PaymentMethod as PrismaPaymentMethod } from "@prisma/client";

export class PrismaPaymentMethodMapper {
  static toDomain(info: PrismaPaymentMethod): PaymentMethod {
    return PaymentMethod.create({
      bankHolderName: info.bankHolderName,
      bankName: info.bankName,
      city: info.city,
      iban: info.iban,
      userId: new UniqueEntityID(info.userId),
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(address: PaymentMethod): PrismaPaymentMethod {
    return {
      id: address.id.toString(),
      bankHolderName: address.bankHolderName,
      bankName: address.bankName,
      city: address.city,
      iban: address.iban,
      userId: address.userId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}