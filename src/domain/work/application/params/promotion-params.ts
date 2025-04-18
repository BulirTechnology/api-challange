export interface PromotionPaginationParams {
  page: number
  perPage?: number
  language: "en" | "pt"
}

export interface PromotionFindById {
  id: string
  language: "en" | "pt"
}

export interface PromotionFindByCode {
  name: string
  language: "en" | "pt"
}