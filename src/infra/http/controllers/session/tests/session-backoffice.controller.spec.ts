import { describe, it, expect, beforeEach, vi } from "vitest";
import { SessionBackofficeController } from "../session-backoffice.controller";
import { EnvService } from "@/infra/environment/env.service";
import { SessionBackofficeUseCase } from "@/domain/users/application/use-cases/user/authentication/session-backoffice";
import { ValidationService } from "../../../pipes/validation.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { WrongCredentialsError } from "@/domain/users/application/use-cases/errors/wrong-credentials-error";
import { UsersRepository } from "@/domain/users/application/repositories";
import {
  Encrypter,
  HashComparator,
} from "@/domain/users/application/cryptography";
import { I18nService } from "nestjs-i18n";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/infra/environment/env";
import { left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  AccountType,
  AuthProvider,
  Language,
  UserState,
} from "@/domain/users/enterprise";

describe("SessionBackofficeController", () => {
  let controller: SessionBackofficeController;
  let envService: EnvService;
  let backofficeUseCase: SessionBackofficeUseCase;
  let validationService: ValidationService;

  beforeEach(() => {
    const configService = {
      get: vi.fn().mockReturnValue("some_value"),
    } as unknown as ConfigService<Env, true>;
    envService = new EnvService(configService);

    const usersRepository = {} as UsersRepository;
    const hashComparator = {} as HashComparator;
    const encrypter = {} as Encrypter;
    backofficeUseCase = new SessionBackofficeUseCase(
      usersRepository,
      hashComparator,
      encrypter
    );

    const i18nService = {} as I18nService;
    validationService = new ValidationService(i18nService);

    controller = new SessionBackofficeController(
      envService,
      backofficeUseCase,
      validationService
    );
  });

  it("should return user and tokens on successful authentication", async () => {
    const headers = { "accept-language": "en" };
    const data = {
      account_type: "SuperAdmin" as const,
      email: "test@example.com",
      password: "password123",
      remember_me: false,
    };

    const user = {
      id: new UniqueEntityID("1"),
      email: "test@example.com",
      state: "Active" as UserState,
      defaultLanguage: "en" as Language,
      accountType: "SuperAdmin" as AccountType,
      authProvider: "email" as AuthProvider,
    };
    const token = "access_token";
    const refreshToken = "refresh_token";

    vi.spyOn(validationService, "validateData").mockResolvedValue();
    vi.spyOn(backofficeUseCase, "execute").mockResolvedValue(
      right({
        user,
        token,
        refreshToken,
      })
    );

    const result = await controller.handle(headers, data);

    expect(result).toEqual({
      user: {
        id: "1",
        email: "test@example.com",
        state: "Active",
        default_language: "en",
        account_type: "SuperAdmin",
        auth_provider: "email",
      },
      access_token: token,
      refresh_token: refreshToken,
    });
  });

  it("should throw BadRequestException on validation error", async () => {
    const headers = { "accept-language": "en" };
    const data = {
      account_type: "SuperAdmin" as const,
      email: "test@example.com",
      password: "password123",
      remember_me: false,
    };

    vi.spyOn(validationService, "validateData").mockImplementation(() => {
      throw new Error("Validation error");
    });

    await expect(controller.handle(headers, data)).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw UnauthorizedException on wrong credentials", async () => {
    const headers = { "accept-language": "en" };
    const data = {
      account_type: "SuperAdmin" as const,
      email: "test@example.com",
      password: "password123",
      remember_me: false,
    };

    vi.spyOn(validationService, "validateData").mockResolvedValue();
    vi.spyOn(backofficeUseCase, "execute").mockResolvedValue(
      left(new WrongCredentialsError())
    );

    await expect(controller.handle(headers, data)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
