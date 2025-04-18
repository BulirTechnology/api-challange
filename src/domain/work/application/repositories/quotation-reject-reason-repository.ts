import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { QuotationRejectReason } from "../../enterprise/quotation-reject-reason";

export abstract class QuotationRejectReasonRepository {
  abstract findByTitle(title: string): Promise<QuotationRejectReason | null>
  abstract findMany(params: PaginationParams): Promise<Pagination<QuotationRejectReason>>
  abstract findById(id: string): Promise<QuotationRejectReason | null>
  abstract create(answer: QuotationRejectReason): Promise<QuotationRejectReason>
}
 