import { Pagination } from "@/core/repositories/pagination-params";
import { SubSubCategory } from "../../enterprise/sub-sub-category";
import { SubSubCategoryFindById, SubSubCategoryPaginationParams } from "../params/sub-sub-category-params";
 
export abstract class SubSubCategoriesRepository {
  abstract findByTitle(title: string): Promise<SubSubCategory | null>
  abstract findMany(params: SubSubCategoryPaginationParams): Promise<Pagination<SubSubCategory>>
  abstract findById(params: SubSubCategoryFindById): Promise<SubSubCategory | null>
  abstract create(category: SubSubCategory): Promise<SubSubCategory>
  abstract update(category: SubSubCategory, language: "pt" | "en"): Promise<SubSubCategory>
  abstract updateImage(categoryId: string, url: string): Promise<void>
}
