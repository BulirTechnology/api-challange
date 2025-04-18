import { Specialization } from "@/domain/users/enterprise/specialization";

export class SpecializationPresenter {
  static toHTTP(specialization: Specialization, storageUrl: string) {
    return {
      id: specialization.id.toString(),
      title: specialization.title,
      service_provider_id: specialization.serviceProviderId.toString(),
      price: specialization.price,
      rate: specialization.rate,
      category: specialization.category,
      category_id: specialization.categoryId?.toString(),
      category_url: (
        specialization.categoryUrl &&
        specialization.categoryUrl != "null" && 
        specialization.categoryUrl != "undefined"
      ) ? storageUrl + specialization.categoryUrl : null,
      service_id: specialization.serviceId.toString(),
      service: specialization.service,
      sub_category: specialization.subCategory,
      sub_category_id: specialization.subCategoryId?.toString(),
      sub_sub_category: specialization.subSubCategory,
      sub_sub_categoryId: specialization.subSubCategoryId?.toString(),
      created_at: specialization.createdAt,
      updated_at: specialization.updatedAt
    };
  }
}