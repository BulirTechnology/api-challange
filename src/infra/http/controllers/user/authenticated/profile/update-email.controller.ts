import {
  Body,
  Controller,
  Patch,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

import {
  ResourceNotFoundError,
  NotAllowedError
} from "@/core/errors";
import { InvalidOTPCodeError } from "@/domain/users/application/use-cases/errors/invalid-otp-code-error";
import { } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthUpdateEmailUseCase } from "@/domain/users/application/use-cases/user/auth/auth-update-email";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const authUpdateEmailBodySchema = z.object({
  otp: z.string({
    invalid_type_error: "authenticate.otp.invalid_type_error",
    required_error: "authenticate.otp.invalid_type_error"
  }).length(4, {
    message: "authenticate.otp.valid"
  }),
});

type AuthUpdateEmailBodySchema = z.infer<typeof authUpdateEmailBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AuthUpdateEmailController {
  constructor(
    private updateEmail: AuthUpdateEmailUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Patch("update-email")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AuthUpdateEmailBodySchema
  ) {
    try {
      await this.validation.validateData(authUpdateEmailBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateEmail.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      code: data.otp,
      verificationFor: "Email"
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else if (error.constructor == InvalidOTPCodeError || error.constructor == NotAllowedError)
        throw new BadRequestException(this.i18n.t("errors.authenticate.otp.invalid_file_type", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}