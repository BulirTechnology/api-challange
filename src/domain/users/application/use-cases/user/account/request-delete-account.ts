import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { UsersRepository } from "../../../repositories";

interface RequestDeleteAccountUseCaseRequest {
  userId: string
}

type RequestDeleteAccountUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class RequestDeleteAccountUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId
  }: RequestDeleteAccountUseCaseRequest): Promise<RequestDeleteAccountUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(
        new ResourceNotFoundError(
          this.i18n.t(
            "errors.user.not_found",
            { lang: I18nContext.current()?.lang }
          )
        )
      );
    }

    await this.usersRepository.updateState(userId, "RequestDelete");

    return right(null);
  }
}
