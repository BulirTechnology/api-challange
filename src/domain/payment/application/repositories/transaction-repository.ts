import { Pagination } from "@/core/repositories/pagination-params";
import { Transaction } from "../../enterprise/transaction";
import { TransactionPaginationParams } from "../params/transaction-params";
import { LanguageSlug } from "@/domain/users/enterprise";

export abstract class TransactionRepository {
  abstract findMany(params: TransactionPaginationParams): Promise<Pagination<Transaction>>
  abstract findById(id: string, language: LanguageSlug): Promise<Transaction | null>
  abstract create(transaction: Transaction): Promise<Transaction>
  abstract countTransactionInComingAmount(params: { month: number, year: number, walletId: string }): Promise<number>
}
