export interface ServicePaginationParams {
  page: number
  perPage?: number
  subSubcategoryId?: string
  language: "en" | "pt"
}

export interface ServiceManyBySubCategory {
  page: number
  perPage?: number
  subCategoryId: string
  language: "en" | "pt"
}

export interface ServiceFindById {
  id: string
  language: "en" | "pt"
}