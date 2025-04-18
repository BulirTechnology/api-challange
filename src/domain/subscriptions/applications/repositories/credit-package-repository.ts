import { Pagination } from "@/core/repositories/pagination-params";
import {
  CreditPackage,
  CreditPackageStatus
} from "../../enterprise";

export abstract class CreditPackageRepository {
  abstract findMany(params: {
    page: number
    perPage: number
    status: CreditPackageStatus | "ALL"
  }): Promise<Pagination<CreditPackage>>
  abstract findByName(name: string): Promise<CreditPackage | null>
  abstract create(plan: CreditPackage): Promise<CreditPackage>
}
