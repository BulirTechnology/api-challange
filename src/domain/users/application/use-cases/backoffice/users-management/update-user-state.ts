import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { UsersRepository } from "../../../repositories";
import { ResourceNotFoundError } from "@/core/errors";
import { UserState } from "@prisma/client";

interface UpdateUserStateUseCaseRequest {
  id: string;
  state: UserState;
}

type UpdateUserStateUseCaseResponse = Either<
  ResourceNotFoundError,
  { success: boolean }
>;

@Injectable()
export class UpdateUserStateUseCase {
  constructor(private userRepository: UsersRepository) {}

  async execute({
    id,
    state,
  }: UpdateUserStateUseCaseRequest): Promise<UpdateUserStateUseCaseResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    await this.userRepository.updateState(id, state);

    return right({ success: true });
  }
}
