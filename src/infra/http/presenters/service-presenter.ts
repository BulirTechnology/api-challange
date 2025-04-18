import { Service } from "@/domain/work/enterprise/service";

export class ServicePresenter {
  static toHTTP(service: Service) {
    return {
      id: service.id.toString(),
      title: service.title,
      parent_id: service.parentId.toString(),
      created_at: service.createdAt,
      updated_at: service.updatedAt
    };
  }
}