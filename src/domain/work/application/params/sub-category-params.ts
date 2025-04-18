export interface SubCategoryPaginationParams {
  page: number
  perPage?: number
  categoryId: string
  language: "en" | "pt"
}

export interface SubCategoryFindById {
  id: string
  language: "en" | "pt"
}