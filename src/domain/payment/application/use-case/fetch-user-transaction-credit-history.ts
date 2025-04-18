import { Injectable } from "@nestjs/common";
import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  Either,
  right
} from "@/core/either";

import { Transaction } from "../../enterprise";
import { TransactionRepository } from "../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchUserTransactionCreditHistoryUseCaseRequest {
  page: number
  perPage?: number
  userId: string
  language: LanguageSlug
}

type FetchUserTransactionCreditHistoryUseCaseResponse = Either<
  null,
  {
    transactions: Transaction[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchUserTransactionCreditHistoryUseCase {
  constructor(private transactionsRepository: TransactionRepository) { }

  async execute({
    page,
    userId,
    perPage,
    language
  }: FetchUserTransactionCreditHistoryUseCaseRequest): Promise<FetchUserTransactionCreditHistoryUseCaseResponse> {
    const transactions = await this.transactionsRepository.findMany({
      page,
      perPage,
      userId,
      language,
      types: ["DiscountCredit", "PurchaseCredit"]
    });

    return right({
      transactions: transactions.data,
      meta: transactions.meta
    });
  }
}
