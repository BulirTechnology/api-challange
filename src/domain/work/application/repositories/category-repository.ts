import { Pagination } from "@/core/repositories/pagination-params";
import { Category } from "../../enterprise/category";
import { CategoryFindById, CategoryPaginationParams } from "../params/category-params";

export abstract class CategoriesRepository {
  abstract findByTitle(title: string): Promise<Category | null>
  abstract findMany(params: CategoryPaginationParams): Promise<Pagination<Category>>
  abstract findById(params: CategoryFindById): Promise<Category | null>
  abstract create(category: Category): Promise<Category>
  abstract update(category: Category, language: "pt" | "en"): Promise<Category>
  abstract updateImage(categoryId: string, url: string): Promise<void>
}
