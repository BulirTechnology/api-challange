import { Quotation } from "@/domain/work/enterprise/quotation";

export class QuotationPresenter {
  static toHTTP(quotation: Quotation, storageUrl: string) {

    return {
      id: quotation.id.toString(),
      budget: quotation.budget,
      cover: quotation.cover,
      created_at: quotation.createdAt,
      description: quotation.cover,
      service_provider_name: quotation.serviceProviderName,
      client_profile_url: quotation.clientProfileUrl ? storageUrl + quotation.clientProfileUrl : null,
      client_rating: quotation.clientRating,
      service_provider_profile_url: quotation.serviceProviderProfileUrl ? storageUrl + quotation.serviceProviderProfileUrl : null,
      serviceProviderRating: quotation.serviceProviderRating,
      status: quotation.state,
      date: quotation.date,
      job_id: quotation.jobId.toString(),
      read_by_client: quotation.readByClient,
      reject_description: quotation.rejectDescription,
      service_provider_is_favorite: quotation.isServiceProviderFavoriteOfClient,
      reject_reason_id: quotation.rejectReasonId?.toString(),
      service_provider_id: quotation.serviceProviderId?.toString(),
      state: quotation.state,
      updated_at: quotation.updatedAt
    };
  }
}