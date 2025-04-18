import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Transaction } from "@/domain/payment/enterprise/transaction";
import { LanguageSlug } from "@/domain/users/enterprise";

import { Transaction as PrismaTransaction } from "@prisma/client";

export class PrismaTransactionMapper {
  static toDomain(info: PrismaTransaction, language: LanguageSlug): Transaction {
    return Transaction.create({
      amount: info.amount,
      description: language === "pt" ? info.description : info.descriptionEn,
      descriptionEn: info.descriptionEn,
      jobId: info.jobId ? new UniqueEntityID(info.jobId) : null,
      status: info.status,
      type: info.type,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt ? info.updatedAt : new Date(),
      walletId: new UniqueEntityID(info.walletId),
      promotionId: info.promotionId ? new UniqueEntityID(info.promotionId) : null
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(transaction: Transaction): PrismaTransaction {
    return {
      id: transaction.id.toString(),
      amount: transaction.amount,
      description: transaction.description,
      descriptionEn: transaction.descriptionEn,
      jobId: transaction.jobId ? transaction.jobId.toString() : null,
      status: transaction.status,
      type: transaction.type,
      promotionId: transaction.promotionId ? transaction.promotionId.toString() : null,
      walletId: transaction.walletId.toString(),
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt ? transaction.updatedAt : new Date()
    };
  }
}