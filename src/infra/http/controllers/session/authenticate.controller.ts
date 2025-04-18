import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Headers,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import { EnvService } from "@/infra/environment/env.service";

import { WrongCredentialsError } from "@/domain/users/application/use-cases/errors/wrong-credentials-error";
import { AuthenticateUserUseCase } from "@/domain/users/application/use-cases/user/authentication/authenticate-user";

import { AuthPresenter } from "../../presenters/auth-presenter";
import { ValidationService } from "../../pipes/validation.service";

const authenticateBodyBodySchema = z.object({
  account_type: z.enum(["Client", "ServiceProvider"], {
    invalid_type_error: "authenticate.account_type.invalid_type_error",
    required_error: "authenticate.account_type.invalid_type_error",
  }),
  email: z
    .string({
      required_error: "authenticate.email.invalid_type_error",
    })
    .email({
      message: "authenticate.email.valid",
    }),
  password: z.string({
    required_error: "authenticate.password.invalid_type_error",
    invalid_type_error: "authenticate.password.invalid_type_error",
  }),
  remember_me: z.boolean().optional().default(false),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodyBodySchema>;

@ApiTags("Sessions")
@Controller("/sessions")
@Public()
export class AuthenticatedController {
  constructor(
    private env: EnvService,
    private authenticateUser: AuthenticateUserUseCase,
    private validation: ValidationService
  ) {}

  @Post()
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: AuthenticateBodySchema
  ) {
    try {
      await this.validation.validateData(authenticateBodyBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const { email, password, account_type } = data;

    const result = await this.authenticateUser.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      accountType: account_type,
      email,
      password,
      rememberMe: data.remember_me,
      validateWithPassword: true,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      user: AuthPresenter.toHTTP(
        result.value.user,
        this.env.get("STORAGE_URL")
      ),
      access_token: result.value.token,
      refresh_token: result.value.refreshToken,
    };
  }
}
