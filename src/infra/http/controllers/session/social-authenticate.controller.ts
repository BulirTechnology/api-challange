import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Headers,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "@/infra/auth/public";

import { z } from "zod";
import { ValidationService } from "../../pipes/validation.service";
import { AccountAlreadyExistsError } from "@/domain/users/application/use-cases/errors/account-already-exists-error";
import { SocialAuthenticateUseCase } from "@/domain/users/application/use-cases/user/authentication/social-authenticate";
import { AuthPresenter } from "../../presenters/auth-presenter";
import { EnvService } from "@/infra/environment/env.service";

const authenticateBodyBodySchema = z.object({
  auth_provider: z.enum(["apple", "google", "facebook"]),
  id_token: z.string(),
  email: z.string({
    required_error: "authenticate.email.invalid_type_error"
  })
    .email({
      message: "authenticate.email.valid"
    }),
  last_name: z.string(),
  first_name: z.string(),
  photo: z.string().optional().default(""),
  remember_me: z.boolean().optional().default(false),
  fcm_token: z.string().optional()
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodyBodySchema>

@ApiTags("Sessions")
@Controller("/sessions")
@Public()
export class SocialAuthenticateController {
  constructor(
    private env: EnvService,
    private socialAuthenticateUseCase: SocialAuthenticateUseCase,
    private validation: ValidationService
  ) { }

  @Post("social")
  async handleLogin(
    @Headers() headers: Record<string, string>,
    @Body() data: AuthenticateBodySchema
  ) {
    try {
      await this.validation.validateData(authenticateBodyBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.socialAuthenticateUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      email: data.email,
      lastName: data.last_name,
      pushNotificationToken: data.fcm_token,
      firstName: data.first_name,
      idToken: data.id_token,
      photoUrl: data.photo,
      rememberMe: data.remember_me,
      authProvider: data.auth_provider
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == AccountAlreadyExistsError)
        throw new ConflictException({
          field: "email",
          message: "Account with this email already exist",
          error: "Conflict",
          status_code: 409
        });

      throw new BadRequestException({
        message: error.message,
        error: "Bad Request",
        status_code: 409,
        field: error.field,
      });
    }

    return {
      user: AuthPresenter.toHTTP(response.value.user, this.env.get("STORAGE_URL")),
      access_token: response.value.token,
      refresh_token: response.value.refreshToken
    };
  }
}
