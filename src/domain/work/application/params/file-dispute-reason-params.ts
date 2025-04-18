export interface FileDisputePaginationParams {
  page: number
  perPage?: number
  language: "en" | "pt"
}

export interface FileDisputeFindById {
  id: string
  language: "en" | "pt"
}