import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Headers,
} from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { Public } from "@/infra/auth/public";
import { EnvService } from "@/infra/environment/env.service";
import { WrongCredentialsError } from "@/domain/users/application/use-cases/errors/wrong-credentials-error";
import { AuthPresenter } from "../../presenters/auth-presenter";
import { ValidationService } from "../../pipes/validation.service";
import { SessionBackofficeUseCase } from "@/domain/users/application/use-cases/user/authentication/session-backoffice";
import { SesionBackofficeDTO } from "./dtos/session-backoffice.dto";

const sessionBackofficeSchema = z.object({
  account_type: z.enum(["SuperAdmin"], {
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

export type SessionBackofficeSchema = z.infer<typeof sessionBackofficeSchema>;

@ApiTags("Sessions")
@Controller("/sessions")
@Public()
export class SessionBackofficeController {
  constructor(
    private env: EnvService,
    private backoffice: SessionBackofficeUseCase,
    private validation: ValidationService
  ) {}

  @ApiBody({ type: SesionBackofficeDTO })
  @Post("/backoffice")
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: SessionBackofficeSchema
  ) {
    try {
      await this.validation.validateData(sessionBackofficeSchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const { email, password, account_type } = data;

    const result = await this.backoffice.execute({
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
