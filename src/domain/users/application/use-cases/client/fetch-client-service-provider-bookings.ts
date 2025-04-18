import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import {
  UsersRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import {
  BookingsRepository
} from "@/domain/work/application/repositories";

import { Booking } from "@/domain/work/enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchClientServiceProviderBookingsUseCaseRequest {
  language: LanguageSlug
  userId: string
  page: number
  perPage?: number
  serviceProviderId: string
}

type FetchClientServiceProviderBookingsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    bookings: Booking[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientServiceProviderBookingsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private bookingsRepository: BookingsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    userId,
    serviceProviderId,
    perPage
  }: FetchClientServiceProviderBookingsUseCaseRequest): Promise<FetchClientServiceProviderBookingsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));

    const serviceProvider = await this.serviceProvidersRepository.findById(serviceProviderId);

    if (!serviceProvider)
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));

    const bookings = await this.bookingsRepository.findServiceProviderBooking({
      page,
      serviceProviderId: serviceProvider.id.toString(),
      status: "COMPLETED",
      perPage
    });

    return right({
      bookings: bookings.data,
      meta: bookings.meta
    });
  }
}