import { ClientJobType } from "@/domain/work/application/use-case/jobs/fetch-client-jobs";
import { Job } from "@/domain/work/enterprise/job";

export class JobPresenter {
  static toHTTP(job: Job, storageUrl: string) {
    return {
      id: job.id.toString(),
      title: job.title,
      description: job.description,
      view_state: job.viewState,
      address_id: job.addressId?.toString(),
      address: job.address,
      quotations: job.quotations?.map(item => ({
        id: item.id,
        service_provider_id: item.serviceProviderId.toString(),
        created_at: item.date,
        date: item.date,
        budget: item.budget,
        readByClient: item.readByClient,
        profile_url: item.profileUrl ? storageUrl + item.profileUrl : null,
        rating: item.rating,
        status: item.status,
        description: item.description,
        service_provider_is_favorite: item.serviceProviderIsFavorite,
        service_provider_name: item.serviceProviderName
      })),
      image1: job.image1 && job.image1 != "null" ? storageUrl + job.image1 : null,
      image2: job.image2 && job.image2 != "null" ? storageUrl + job.image2 : null,
      image3: job.image3 && job.image3 != "null" ? storageUrl + job.image3 : null,
      image4: job.image4 && job.image4 != "null" ? storageUrl + job.image4 : null,
      image5: job.image5 && job.image5 != "null" ? storageUrl + job.image5 : null,
      image6: job.image6 && job.image6 != "null" ? storageUrl + job.image6 : null,
      answers: job.answers,
      client_id: job.clientId?.toString(),
      category: job.category,
      category_id: job.categoryId?.toString(),
      sub_category: job.subCategory,
      sub_category_id: job.subCategoryId?.toString(),
      sub_sub_category: job.subSubCategory,
      sub_sub_category_id: job.subSubCategoryId?.toString(),
      service: job.service,
      service_id: job.serviceId?.toString(),
      start_date: job.startDate,
      state: job.state,
      price: job.price,
      quotation_state: job.quotationState,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    };
  }
}

export class ClientJobPresenter {
  static toHTTP(job: ClientJobType, storageUrl: string) {

    return {
      id: job.id.toString(),
      title: job.title,
      new_quotations: job.newQuotations,
      description: job.description,
      view_state: job.viewState,
      address_id: job.addressId?.toString(),
      address: job.address,
      quotations: job.quotations?.map(item => ({
        id: item.id,
        service_provider_name: item.serviceProviderName,
        service_provider_id: item.serviceProviderId,
        created_at: item.date,
        date: item.date,
        budget: item.budget,
        read_by_client: item.readByClient,
        profile_url: item.profileUrl ? storageUrl + item.profileUrl : null,
        rating: item.rating,
        status: item.status,
        description: item.description,
        service_provider_is_favorite: item.serviceProviderIsFavorite
      })),
      image1: job.image1 && job.image1 != "null" ? storageUrl + job.image1 : null,
      image2: job.image2 && job.image2 != "null" ? storageUrl + job.image2 : null,
      image3: job.image3 && job.image3 != "null" ? storageUrl + job.image3 : null,
      image4: job.image4 && job.image4 != "null" ? storageUrl + job.image4 : null,
      image5: job.image5 && job.image5 != "null" ? storageUrl + job.image5 : null,
      image6: job.image6 && job.image6 != "null" ? storageUrl + job.image6 : null,
      answers: job.answers,
      client_id: job.clientId?.toString(),
      category: job.category,
      category_id: job.categoryId?.toString(),
      sub_category: job.subCategory,
      sub_category_id: job.subCategoryId?.toString(),
      sub_sub_category: job.subSubCategory,
      sub_sub_category_id: job.subSubCategoryId?.toString(),
      service: job.service,
      service_id: job.serviceId?.toString(),
      start_date: job.startDate,
      state: job.state,
      price: job.price,
      quotation_state: job.quotationState,
      created_at: job.createdAt,
      updated_at: job.updatedAt
    };
  }
}