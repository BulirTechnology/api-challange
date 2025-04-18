import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { UsersRepository } from "../../../repositories";

interface UpdateUserSocketUseCaseRequest {
  userId: string
  socketId: string
}

type UpdateUserSocketUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateUserSocketUseCase {
  constructor(
    private usersRepository: UsersRepository
  ) { }

  async execute({
    userId,
    socketId
  }: UpdateUserSocketUseCaseRequest): Promise<UpdateUserSocketUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    await this.usersRepository.updateSocketId(userId, socketId);

    return right(null);
  }
}
