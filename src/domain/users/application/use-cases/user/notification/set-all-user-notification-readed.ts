import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  NotificationsRepository,
  UsersRepository
} from "../../../repositories";

interface SetAllUserNotificationReadedUseCaseRequest {
  userId: string
}

type SetAllUserNotificationReadedUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SetAllUserNotificationReadedUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private notificationsRepository: NotificationsRepository
  ) { }

  async execute({
    userId,
  }: SetAllUserNotificationReadedUseCaseRequest): Promise<SetAllUserNotificationReadedUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    await this.notificationsRepository.setAllAsReaded({ userId });

    return right(null);
  }
}
