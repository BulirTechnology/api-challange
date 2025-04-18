export interface CategoryPaginationParams {
  page: number
  language: "en" | "pt"
  perPage?: number
}

export interface CategoryFindById {
  id: string
  language: "en" | "pt"
}