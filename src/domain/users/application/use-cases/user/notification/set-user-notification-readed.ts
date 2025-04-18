import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { InvalidNotificationError } from "../../errors/invalid-notification-error";
import {
  NotificationsRepository,
  UsersRepository
} from "../../../repositories";

interface SetUserNotificationReadedUseCaseRequest {
  language: "en" | "pt"
  userId: string
  notificationId: string
}

type SetUserNotificationReadedUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SetUserNotificationReadedUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private notificationsRepository: NotificationsRepository
  ) { }

  async execute({
    userId,
    notificationId,
    language
  }: SetUserNotificationReadedUseCaseRequest): Promise<SetUserNotificationReadedUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const addressItem = await this.notificationsRepository.findById({
      language,
      id: notificationId
    });
    if (addressItem?.userId.toString() !== userId) {
      return left(new InvalidNotificationError());
    }

    await this.notificationsRepository.setAsReaded(notificationId, userId);

    return right(null);
  }
}
