import {
  Controller,
  Post,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Body,
  Headers,
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { AccountAlreadyExistsError } from "@/domain/users/application/use-cases/errors/account-already-exists-error";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthRequestUpdateEmailUseCase } from "@/domain/users/application/use-cases/user/auth/auth-request-update-email";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const authRequestUpdateEmailBodySchema = z.object({
  email: z.string({
    invalid_type_error: "user.email.invalid_type_error",
    required_error: "user.email.invalid_type_error"
  }).email({
    message: "Informe um e-mail valido"
  })
});

type AuthRequestUpdateEmailBodySchema = z.infer<typeof authRequestUpdateEmailBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AuthRequestUpdateEmailController {
  constructor(
    private requestUpdateEmail: AuthRequestUpdateEmailUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post("request-update-email")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AuthRequestUpdateEmailBodySchema
  ) {
    try {
      await this.validation.validateData(authRequestUpdateEmailBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.requestUpdateEmail.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      email: data.email,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == AccountAlreadyExistsError)
        throw new ConflictException(this.i18n.t("errors.user.account_already_exist", {
          lang: I18nContext.current()?.lang
        }));
      else if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}