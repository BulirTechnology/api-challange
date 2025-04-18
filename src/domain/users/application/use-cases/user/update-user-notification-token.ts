import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UsersRepository } from "../../repositories/user-repository";

interface UpdateUserNotificationTokenUseCaseRequest {
  userId: string;
  notificationToken: string;
}

type UpdateUserNotificationTokenUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>;

@Injectable()
export class UpdateUserNotificationTokenUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    notificationToken,
  }: UpdateUserNotificationTokenUseCaseRequest): Promise<UpdateUserNotificationTokenUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    await this.usersRepository.updateNotificationToken(
      userId,
      notificationToken
    );

    return right(null);
  }
}
