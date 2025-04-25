import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { WrongCredentialsError } from "../errors";
import { Encrypter } from "../../cryptography";

import { UsersRepository } from "../../repositories";

interface RefreshTokenUserUseCaseRequest {
  language: "en" | "pt"
  userId: string
}

type RefreshTokenUserUseCaseResponse = Either<
  WrongCredentialsError,
  {
    refreshToken: string,
    token: string
  }
>

@Injectable()
export class RefreshTokenUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private encrypter: Encrypter
  ) { }

  async execute({
    userId
  }: RefreshTokenUserUseCaseRequest): Promise<RefreshTokenUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    if (!user.isAuthenticated || !user.refreshToken) {
      return left(new WrongCredentialsError());
    }

    const { accessToken } = await this.encrypter.encrypt({ sub: user.id.toString(), role: user.accountType }, false);

    return right({
      token: accessToken,
      refreshToken: `${user.refreshToken}`
    });
  }
}
