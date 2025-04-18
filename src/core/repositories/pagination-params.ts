export interface PaginationParams {
  page: number
  perPage?: number
}

export interface Pagination<T> {
  data: T[],
  meta: MetaPagination
}

export interface MetaPagination {
  total: number,
  lastPage: number,
  currentPage: number,
  perPage: number,
  prev: number | null,
  next: number | null,
}