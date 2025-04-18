import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Transaction } from "../../enterprise";
import { TransactionRepository } from "../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchUserTransactionHistoryUseCaseRequest {
  page: number
  perPage?: number
  userId: string
  language: LanguageSlug
}

type FetchUserTransactionHistoryUseCaseResponse = Either<
  null,
  {
    transactions: Transaction[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchUserTransactionHistoryUseCase {
  constructor(private transactionsRepository: TransactionRepository) { }

  async execute({
    page,
    userId,
    perPage,
    language
  }: FetchUserTransactionHistoryUseCaseRequest): Promise<FetchUserTransactionHistoryUseCaseResponse> {
    const transactions = await this.transactionsRepository.findMany({
      page,
      perPage,
      userId,
      language,
      types: [
        "AddMoney",
        "Promotion",
        "ServicePayment",
        "ServiceFee",
        "Refund",
        "ServiceSalary",
        "SubscriptionDebts",
        "SubscriptionPayment",
        "Withdrawal"
      ]
    });

    return right({
      transactions: transactions.data,
      meta: transactions.meta
    });
  }
}
