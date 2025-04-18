import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { NotificationsRepository } from "../../../repositories";
import { Notification } from "@/domain/users/enterprise";

interface FetchUserNotificationsUseCaseRequest {
  language: "en" | "pt"
  page: number
  perPage?: number
  userId: string
}

type FetchUserNotificationsUseCaseResponse = Either<
  null,
  {
    notifications: Notification[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchUserNotificationsUseCase {
  constructor(private userNotificationsRepository: NotificationsRepository) { }

  async execute({
    page,
    perPage,
    userId,
    language
  }: FetchUserNotificationsUseCaseRequest): Promise<FetchUserNotificationsUseCaseResponse> {
    const notifications = await this.userNotificationsRepository.findManyByUserId({
      page,
      perPage,
      userId,
      language
    });

    return right({
      notifications: notifications.data,
      meta: notifications.meta
    });
  }
}
