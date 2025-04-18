import { LanguageSlug } from "@/domain/users/enterprise";
import { TransactionType } from "../../enterprise/transaction";

export interface TransactionPaginationParams {
  page: number
  perPage?: number
  userId?: string
  language: LanguageSlug
  types: TransactionType[]
}
