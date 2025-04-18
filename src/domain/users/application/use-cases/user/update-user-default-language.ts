import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UsersRepository } from "../../repositories/user-repository";
import { Language } from "@/domain/users/enterprise/user";

interface UpdateUserDefaultLanguageUseCaseRequest {
  userId: string
  language: Language,
}

type UpdateUserDefaultLanguageUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateUserDefaultLanguageUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) { }

  async execute({
    userId,
    language
  }: UpdateUserDefaultLanguageUseCaseRequest): Promise<UpdateUserDefaultLanguageUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    await this.usersRepository.updateDefaultLanguage(userId, language);

    return right(null);
  }
}
