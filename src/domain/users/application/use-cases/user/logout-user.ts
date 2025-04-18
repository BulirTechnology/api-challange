import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { UsersRepository, FcmTokenRepository } from "../../repositories";

import { WrongCredentialsError } from "../errors/wrong-credentials-error";

interface LogoutUserUseCaseRequest {
  language: "en" | "pt";
  userId: string;
}

type LogoutUserUseCaseResponse = Either<WrongCredentialsError, null>;

@Injectable()
export class LogoutUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private fcmTokenRepository: FcmTokenRepository
  ) {}

  async execute({
    userId,
  }: LogoutUserUseCaseRequest): Promise<LogoutUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    await this.usersRepository.updateRefreshToken({
      userId: userId,
      isAuthenticated: false,
      refreshToken: null,
    });
    await this.fcmTokenRepository.deleteOfUser(userId);

    return right(null);
  }
}
