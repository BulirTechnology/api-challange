import { left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "@/domain/users/application/repositories";
import { Encrypter, HashComparator } from "../../../cryptography";
import { WrongCredentialsError } from "../../errors/wrong-credentials-error";
import { handleCanAuthentication } from "./helper/handle-can-authentication";
import {
  SessionBackofficeUseCaseRequest,
  SessionBackofficeUseCaseResponse,
} from "./types";

@Injectable()
export class SessionBackofficeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparator: HashComparator,
    private encrypter: Encrypter
  ) {}

  async execute({
    email,
    password,
    accountType,
    rememberMe,
    validateWithPassword,
  }: SessionBackofficeUseCaseRequest): Promise<SessionBackofficeUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({
      email,
      accountType,
    });

    if (!user) {
      return left(new WrongCredentialsError());
    }

    const canAuthenticate = await handleCanAuthentication({
      hashComparator: this.hashComparator,
      password,
      user,
      validateWithPassword,
    });

    if (canAuthenticate instanceof Error) {
      return left(canAuthenticate);
    }

    const { accessToken, refreshToken } = await this.encrypter.encrypt(
      { sub: user.id.toString(), role:accountType },
      rememberMe
    );

    await this.usersRepository.updateRefreshToken({
      userId: user.id.toString(),
      isAuthenticated: true,
      refreshToken,
    });

    return right({
      token: accessToken,
      accountType,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        state: user.state,
        defaultLanguage: user.defaultLanguage,
        accountType: user.accountType,
        authProvider: user.authProvider,
      },
    });
  }
}
