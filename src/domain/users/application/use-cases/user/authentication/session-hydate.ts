import {
  Either,
  left,
  right
} from "@/core/either";
import { Injectable } from "@nestjs/common";

import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository,
  NotificationsRepository
} from "@/domain/users/application/repositories";

import { WrongCredentialsError } from "../../errors/wrong-credentials-error";

import {
  JobsRepository,
  BookingsRepository,
  ConversationsRepository
} from "@/domain/work/application/repositories";

import { ResourceNotFoundError } from "@/core/errors";
import { AccountType } from "@/domain/users/enterprise";

interface AuthenticateUserUseCaseRequest {
  userId: string
}

type AuthenticateUserUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accountType: AccountType

    unreadedQuotations: number
    pendingRequestToStartOrFinish: number
    unreadedMessages: number
    unreadedNotifications: number

    newsNearJobs: number
    totalAcceptedOrRejectedBooking: number
  }
>

@Injectable()
export class SessionHydrateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private jobsRepository: JobsRepository,
    private bookingsRepository: BookingsRepository,
    private conversationsRepository: ConversationsRepository,
    private notificationsRepository: NotificationsRepository
  ) { }

  async execute({
    userId
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const client = await this.clientRepository.findByEmail(user.email);
    const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);

    let
      newQuotations = 0,
      pendingRequestToStartOrFinish = 0,
      totalUnreadedMessages = 0,
      totalUnreadedNotifications = 0,

      newsNearJobs = 0,
      totalAcceptedOrRejectedBooking = 0;

    if (client) {
      newQuotations = await this.jobsRepository.countUnreadedQuotations({
        clientId: client.id.toString(),
      });

      pendingRequestToStartOrFinish += await this.bookingsRepository.getTotalRequestBookingByState({
        accountType: "Client",
        parentId: client.id.toString(),
        requestWorkState: "REQUEST_START"
      })

      pendingRequestToStartOrFinish += await this.bookingsRepository.getTotalRequestBookingByState({
        accountType: "Client",
        parentId: client.id.toString(),
        requestWorkState: "REQUEST_FINISH"
      })
    }
    if (serviceProvider) {
      newsNearJobs = 0

      totalAcceptedOrRejectedBooking += await this.bookingsRepository.getTotalRequestBookingByState({
        accountType: "ServiceProvider",
        parentId: serviceProvider.id.toString(),
        requestWorkState: "REQUEST_START"
      })
    }

    totalUnreadedMessages = await this.conversationsRepository.countUnreadedMessages({
      userId,
    })

    totalUnreadedNotifications = await this.notificationsRepository.countUnreadedNotifications({
      userId,
    })

    return right({
      accountType: user.accountType,

      unreadedQuotations: newQuotations,
      pendingRequestToStartOrFinish,
      unreadedMessages: totalUnreadedMessages,
      unreadedNotifications: totalUnreadedNotifications,

      newsNearJobs,
      totalAcceptedOrRejectedBooking
    });
  }
}
