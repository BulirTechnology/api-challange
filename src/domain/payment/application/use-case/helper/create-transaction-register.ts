import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  Transaction,
  TransactionState,
  TransactionType
} from "@/domain/payment/enterprise";

import { TransactionRepository } from "../../repositories";

export async function createTransactionRegister({
  amount,
  descriptionEn,
  descriptionPt,
  jobId,
  promotionId,
  status,
  transactionRepository,
  type,
  walletId
}: {
  amount: number,
  descriptionEn: string
  descriptionPt: string
  walletId: UniqueEntityID,
  promotionId: UniqueEntityID | null
  jobId: UniqueEntityID | null
  type: TransactionType,
  status: TransactionState
  transactionRepository: TransactionRepository
}) {
  const transaction = Transaction.create({
    amount,
    description: descriptionPt,
    descriptionEn,
    jobId,
    status,
    type,
    walletId,
    promotionId,
  });

  return await transactionRepository.create(transaction);
}