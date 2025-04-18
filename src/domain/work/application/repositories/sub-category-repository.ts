import { Pagination } from "@/core/repositories/pagination-params";
import { SubCategory } from "../../enterprise/sub-category";
import { SubCategoryFindById, SubCategoryPaginationParams } from "../params/sub-category-params";

export abstract class SubCategoriesRepository {
  abstract findByTitle(title: string): Promise<SubCategory | null>
  abstract findMany(params: SubCategoryPaginationParams): Promise<Pagination<SubCategory>>
  abstract findById(params: SubCategoryFindById): Promise<SubCategory | null>
  abstract create(category: SubCategory): Promise<SubCategory>
  abstract update(category: SubCategory, language: "pt" | "en"): Promise<SubCategory | null>
  abstract updateImage(categoryId: string, url: string): Promise<void>
}
