import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UsersRepository } from "../../repositories/user-repository";

interface UpdateUserOnlineStateUseCaseRequest {
  userId: string
  onlineState: boolean
}

type UpdateUserOnlineStateUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateUserOnlineStateUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) { }

  async execute({
    userId,
    onlineState
  }: UpdateUserOnlineStateUseCaseRequest): Promise<UpdateUserOnlineStateUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    await this.usersRepository.updateOnlineState(userId, onlineState);

    return right(null);
  }
}
