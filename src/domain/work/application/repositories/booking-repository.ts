import { Pagination } from "@/core/repositories/pagination-params";
import { Booking, BookingRequestWorkState, BookingState } from "../../enterprise/booking";
import { AccountType } from "@/domain/users/enterprise/user";

export abstract class BookingsRepository {
  abstract findItemStartInNextDate(params: {
    currentTime: Date,
    secondsFromNow: Date
    perPage?: number
  }): Promise<Pagination<Booking>>
  abstract findExpiredByDate(params: {
    startDate: Date
    perPage?: number
  }): Promise<Pagination<Booking>>
  abstract findClientBooking(params: {
    clientId: string,
    status?: BookingState,
    page: number
    perPage?: number
  }): Promise<Pagination<Booking>>
  abstract getWorkRequestCountsByState(params: { parentId: string, accountType: AccountType }): Promise<{
    active: number
    completed: number
    expired: number
    inDispute: number
    pending: number
  }>
  abstract getTotalRequestBookingByState(params: {
    accountType: AccountType,
    parentId: string,
    requestWorkState: BookingRequestWorkState
  }): Promise<number>
  abstract increaseTotalTryingToFinish: (params: { bookingId: string, total: number }) => Promise<void>
  abstract increaseTotalTryingToStart: (params: { bookingId: string, total: number }) => Promise<void>
  abstract findServiceProviderBooking(params: {
    serviceProviderId: string,
    status: BookingState,
    page: number,
    perPage?: number
  }): Promise<Pagination<Booking>>
  abstract findById(id: string): Promise<Booking | null>
  abstract findByState(params: {}): Promise<Booking[]>
  abstract create(booking: Booking): Promise<string>
  abstract countPostByState(params: { accountType: AccountType, state: BookingState | "ALL", responseId: string }): Promise<number>
  abstract updateState(bookingId: string, state: BookingState): Promise<void>
  abstract updateRequestWorkState(bookingId: string, state: BookingRequestWorkState): Promise<void>
}
