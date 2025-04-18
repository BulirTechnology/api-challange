import { QuotationRejectReason } from "@/domain/work/enterprise/quotation-reject-reason";

export class QuotationRejectReasonPresenter {
  static toHTTP(quotationRejectReason: QuotationRejectReason) {
    return {
      id: quotationRejectReason.id.toString(),
      name: quotationRejectReason.value,
      created_at: quotationRejectReason.createdAt,
      updated_at: quotationRejectReason.updatedAt
    };
  }
}