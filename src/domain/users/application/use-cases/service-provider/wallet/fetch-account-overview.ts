import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ServiceProvidersRepository,
} from "../../../repositories";
import {
  BookingsRepository
} from "@/domain/work/application/repositories";
import {
  WalletRepository,
  TransactionRepository
} from "@/domain/payment/application/repositories";

interface FetchAccountOverviewUseCaseRequest {
  userId: string
}

type FetchAccountOverviewUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    totalBookings: number
    totalActiveBooking: number
    totalEarning: number
  }
>

@Injectable()
export class FetchAccountOverviewUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private bookingRepository: BookingsRepository,
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository
  ) { }

  async execute({
    userId
  }: FetchAccountOverviewUseCaseRequest):
    Promise<FetchAccountOverviewUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const serviceProviderDetails = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProviderDetails) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const wallet = await this.walletRepository.findByUserId(userId);

    const totalActiveBooking = await this.bookingRepository.countPostByState({
      accountType: "ServiceProvider",
      state: "ACTIVE",
      responseId: serviceProviderDetails.id.toString()
    });
    const totalBookings = await this.bookingRepository.countPostByState({
      accountType: "ServiceProvider",
      state: "ALL",
      responseId: serviceProviderDetails.id.toString()
    });

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const totalEarning = await this.transactionRepository.countTransactionInComingAmount({
      month: currentMonth,
      walletId: wallet?.id.toString() + '',
      year: currentYear
    });

    return right({
      totalActiveBooking,
      totalBookings,
      totalEarning
    });
  }
}
