import { Task } from "@/domain/work/enterprise/task";

export class TaskPresenter {
  static toHTTP(task: Task, storageUrl: string) {
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      view_state: task.viewState,
      address_id: task.addressId?.toString(),
      address: {
        id: task.address?.id.toString(),
        name: task.address?.name,
        latitude: task.address?.latitude,
        longitude: task.address?.longitude,
        line1: task.address?.line1,
        line2: task.address?.line2
      },
      image1: task.image1 && task.image1 != "null" ? storageUrl + task.image1 : null,
      image2: task.image2 && task.image2 != "null" ? storageUrl + task.image2 : null,
      image3: task.image3 && task.image3 != "null" ? storageUrl + task.image3 : null,
      image4: task.image4 && task.image4 != "null" ? storageUrl + task.image4 : null, 
      image5: task.image5 && task.image5 != "null" ? storageUrl + task.image5 : null,
      image6: task.image6 && task.image6 != "null" ? storageUrl + task.image6 : null,
      answers: task.answers,
      client_id: task.clientId.toString(),
      category: task.category,
      category_id: task.categoryId?.toString(),
      sub_category: task.subCategory,
      sub_category_id: task.subCategoryId?.toString(),
      sub_sub_category: task.subSubCategory,
      sub_sub_category_id: task.subSubCategoryId?.toString(),
      service: task.service,
      service_id: task.serviceId?.toString(),
      state: task.state,
      price: task.price,
      service_provider_ids: task.serviceProviderIds,
      service_providers: task.serviceProviders,
      start_date: task.startDate,
      draft_step: task.draftStep,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    };
  }
}