import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Patch,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { ResourceNotFoundError } from "@/core/errors";
import { WrongCredentialsError } from "@/domain/users/application/use-cases/errors/wrong-credentials-error";
import { UpdateUserPasswordUseCase } from "@/domain/users/application/use-cases/user/update-user-password";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const updateUserPasswordBodySchema = z.object({
  current_password: z.string({
    invalid_type_error: "user.current_password.invalid_type_error",
    required_error: "user.current_password.invalid_type_error",
  }),
  new_password: z.string({
    invalid_type_error: "user.new_password.invalid_type_error",
    required_error: "user.new_password.invalid_type_error",
  }),
});

type UpdateUserPasswordBodySchema = z.infer<typeof updateUserPasswordBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdatePasswordController {
  constructor(
    private updatePassword: UpdateUserPasswordUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Patch("password")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: UpdateUserPasswordBodySchema
  ) {
    try {
      await this.validation.validateData(updateUserPasswordBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updatePassword.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      currentPassword: data.current_password,
      newPassword: data.new_password
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else if (error.constructor == WrongCredentialsError)
        throw new UnauthorizedException();
      else
        throw new BadRequestException(error.message);
    }
  }

}