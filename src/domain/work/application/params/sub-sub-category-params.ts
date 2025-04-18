export interface SubSubCategoryPaginationParams {
  page: number
  perPage?: number
  subCategoryId: string
  language: "en" | "pt"
}

export interface SubSubCategoryFindById {
  id: string
  language: "en" | "pt"
}