import { AccountType } from "@/domain/users/enterprise/user"

export interface JobPaginationParams {
  page: number
  perPage?: number
  clientId?: string
  categoryId?: string
  serviceId?: string
  postedDate?: string
  expectedDate?: string
  title?: string
  priceSort?: "HighToLow" | "LowToHight"
  statusBooked: boolean,
  statusClosed: boolean,
  statusOpen: boolean,
  viewStatePrivate: boolean,
  viewStatePublic: boolean
  address: { latitude: number, longitude: number }
  accountType: AccountType
  serviceProviderId?: string
  userId: string
}
