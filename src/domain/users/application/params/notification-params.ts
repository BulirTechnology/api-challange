export interface NotificationPaginationParams {
  page: number, 
  userId: string
  perPage?: number
  language: "en" | "pt"
}

export interface NotificationFindById {
  id: string
  language: "en" | "pt"
}