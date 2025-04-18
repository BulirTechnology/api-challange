import { SubSubCategory } from "@/domain/work/enterprise/sub-sub-category";

export class SubSubCategoryPresenter {
  static toHTTP(category: SubSubCategory, storageUrl: string) {
    return {
      id: category.id.toString(),
      title: category.title,
      sub_category_id: category.subCategoryId.toString(),
      url: category.url && category.url != "null" ? storageUrl + category.url : null,
      created_at: category.createdAt,
      updated_at: category.updatedAt
    };
  }
}