import { Category } from "@/domain/work/enterprise/category";

export class CategoryPresenter {
  static toHTTP(category: Category, storageUrl: string) {
    return {
      id: category.id.toString(),
      title: category.title,
      priority: category.priority,
      url: category.url && category.url != "null" ? storageUrl + category.url : null,
      created_at: category.createdAt,
      updated_at: category.updatedAt
    };
  }
}