import { SubCategory } from "@/domain/work/enterprise/sub-category";

export class SubCategoryPresenter {
  static toHTTP(category: SubCategory, storageUrl: string) {
    return {
      id: category.id.toString(),
      title: category.title,
      category_id: category.categoryId.toString(),
      has_sub_sub_category: category.hasSubSubCategory,
      url: category.url ? storageUrl + category.url : null,
      created_at: category.createdAt,
      updated_at: category.updatedAt
    };
  }
}