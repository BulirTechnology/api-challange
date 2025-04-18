import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  NotificationsRepository
} from "../../../repositories";

interface ClearUserNotificationUseCaseRequest {
  language: "en" | "pt"
  userId: string
}

type ClearUserNotificationUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class ClearUserNotificationUseCase {
  constructor(
    private userRepository: UsersRepository,
    private notificationsRepository: NotificationsRepository,
  ) { }

  async execute({
    userId,
  }: ClearUserNotificationUseCaseRequest): Promise<ClearUserNotificationUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    await this.notificationsRepository.deleteMany(userId);

    return right(null);
  }
}
