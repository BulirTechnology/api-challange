import { Injectable } from "@nestjs/common";

import { PaymentMethodsRepository } from "@/domain/users/application/repositories/payment-method-repository";
import { PaymentMethod } from "@/domain/users/enterprise/payment-method";

import { PrismaService } from "../prisma.service";
import { PrismaPaymentMethodMapper } from "../mappers/prisma-payment-method-mapper";

@Injectable()
export class PrismaPaymentMethodsRepository implements PaymentMethodsRepository {
  constructor(private prisma: PrismaService) { }

  async findByUserId(userId: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId }
    });

    return paymentMethod ? PrismaPaymentMethodMapper.toDomain(paymentMethod) : null;
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id }
    });

    return paymentMethod ? PrismaPaymentMethodMapper.toDomain(paymentMethod) : null;
  }
  async create(paymentMethod: PaymentMethod): Promise<void> {
    const data = PrismaPaymentMethodMapper.toPrisma(paymentMethod);

    await this.prisma.paymentMethod.create({ data });
  }
  async update(id: string, paymentMethod: PaymentMethod): Promise<void> {
    const data = PrismaPaymentMethodMapper.toPrisma(paymentMethod);

    await this.prisma.paymentMethod.update({
      where: {
        id,
        userId: data.userId.toString()
      },
      data
    });
  }
}