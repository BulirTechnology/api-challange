import { describe, it, expect, beforeEach, vi } from "vitest";
import { SessionBackofficeUseCase } from "../session-backoffice";
import { UsersRepository } from "@/domain/users/application/repositories";
import { left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  AccountType,
  AuthProvider,
  Language,
  User,
  UserState,
} from "@/domain/users/enterprise";
import {
  Encrypter,
  HashComparator,
} from "@/domain/users/application/cryptography";
import { WrongCredentialsError } from "../../../errors";

describe("SessionBackofficeUseCase", () => {
  let useCase: SessionBackofficeUseCase;
  let usersRepository: UsersRepository;
  let hashComparator: HashComparator;
  let encrypter: Encrypter;

  beforeEach(() => {
    usersRepository = {
      findByEmailAndAccountType: vi.fn(),
      updateRefreshToken: vi.fn(),
    } as unknown as UsersRepository;
    hashComparator = {
      compare: vi.fn(),
    } as unknown as HashComparator;
    encrypter = {
      encrypt: vi.fn(),
    } as unknown as Encrypter;

    useCase = new SessionBackofficeUseCase(
      usersRepository,
      hashComparator,
      encrypter
    );
  });

  it("should return user and tokens on successful authentication", async () => {
    const user = {
      id: new UniqueEntityID("1"),
      email: "test@example.com",
      state: "Active" as UserState,
      defaultLanguage: "en" as Language,
      accountType: "SuperAdmin" as AccountType,
      authProvider: "email" as AuthProvider,
    } as unknown as User;

    const token = "access_token";
    const refreshToken = "refresh_token";

    vi.spyOn(usersRepository, "findByEmailAndAccountType").mockResolvedValue(
      user
    );
    vi.spyOn(hashComparator, "compare").mockResolvedValue(true);
    vi.spyOn(encrypter, "encrypt").mockResolvedValue({
      accessToken: token,
      refreshToken,
    });

    const result = await useCase.execute({
      language: "en",
      email: "test@example.com",
      password: "password123",
      accountType: "SuperAdmin",
      rememberMe: false,
      validateWithPassword: true,
    });

    expect(result).toEqual(
      right({
        token,
        accountType: "SuperAdmin",
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          state: user.state,
          defaultLanguage: user.defaultLanguage,
          accountType: user.accountType,
          authProvider: user.authProvider,
        },
      })
    );
  });

  it("should return WrongCredentialsError if user is not found", async () => {
    vi.spyOn(usersRepository, "findByEmailAndAccountType").mockResolvedValue(
      null
    );
    const result = await useCase.execute({
      language: "en",
      email: "notfound@example.com",
      password: "password123",
      accountType: "SuperAdmin",
      rememberMe: false,
      validateWithPassword: true,
    });

    expect(result).toEqual(left(new WrongCredentialsError()));
  });

  it("should return WrongCredentialsError if password is incorrect", async () => {
    const user = {
      id: new UniqueEntityID("1"),
      email: "test@example.com",
      state: "Active" as UserState,
      defaultLanguage: "en" as Language,
      accountType: "SuperAdmin" as AccountType,
      authProvider: "email" as AuthProvider,
    } as unknown as User;

    vi.spyOn(usersRepository, "findByEmailAndAccountType").mockResolvedValue(
      user
    );

    const result = await useCase.execute({
      language: "en",
      email: "test@example.com",
      password: "wrongpassword",
      accountType: "SuperAdmin",
      rememberMe: false,
      validateWithPassword: true,
    });

    expect(result).toEqual(left(new WrongCredentialsError()));
  });
});
