import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { Portfolio } from "../../enterprise/portfolio";

export abstract class PortfoliosRepository {
  abstract findById(id: string): Promise<Portfolio | null>
  abstract create(portfolio: Portfolio): Promise<Portfolio>
  abstract update(id: string, portfolio: Portfolio): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract findMany(params: PaginationParams & { serviceProviderId: string }): Promise<Pagination<Portfolio>>
}
 