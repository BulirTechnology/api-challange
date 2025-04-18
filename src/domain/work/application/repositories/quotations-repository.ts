import { PaginationParams } from "@/core/repositories/pagination-params";

import { Quotation, QuotationStatus } from "../../enterprise/quotation";

export abstract class QuotationsRepository {
  abstract findManyOfServiceProvider(params: {jobId: string, serviceProviderId: string}): Promise<Quotation[]>
  abstract findMany(params: PaginationParams & { taskId: string }): Promise<Quotation[]>
  abstract findById(id: string): Promise<Quotation | null>
  abstract spHasPendingQuotation(params: { jobId: string, serviceProviderId: string }): Promise<boolean>
  abstract findByServiceProviderAndJob(params: { jobId: string, serviceProviderId: string }): Promise<Quotation | null>
  abstract setAsRead(id: string): Promise<void>
  abstract create(quotation: Quotation): Promise<Quotation>
  abstract updateState(quotationId: string, state: QuotationStatus): Promise<void>
  abstract rejectQuotation(data: {
    id: string
    state: QuotationStatus
    description: string
    reasonId: string
  }): Promise<void>
}
