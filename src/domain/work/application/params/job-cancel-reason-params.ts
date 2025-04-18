export interface JobCancelReasonPaginationParams {
  page: number
  perPage?: number
  language: "en" | "pt"
}

export interface JobCancelReasonFindById {
  id: string
  language: "en" | "pt"
}