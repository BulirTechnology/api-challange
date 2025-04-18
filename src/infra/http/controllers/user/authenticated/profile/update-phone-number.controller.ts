import {
  Body,
  Controller,
  Patch,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Headers,
} from "@nestjs/common";

import { z } from "zod";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { InvalidOTPCodeError } from "@/domain/users/application/use-cases/errors/invalid-otp-code-error";
import { NotAllowedError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthUpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/auth/auth-update-phone-number";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const authUpdatePhoneNumberBodySchema = z.object({
  otp: z
    .string({
      invalid_type_error: "Informe o codigo OTP",
      required_error: "Informe o codigo OTP",
    })
    .length(4, {
      message: "Informe o codigo OTP",
    }),
});

type AuthUpdatePhoneNumberBodySchema = z.infer<
  typeof authUpdatePhoneNumberBodySchema
>;

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AuthUpdatePhoneNumberController {
  constructor(
    private updatePhoneNumber: AuthUpdatePhoneNumberUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) {}

  @Patch("update-phone-number")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AuthUpdatePhoneNumberBodySchema
  ) {
    try {
      await this.validation.validateData(authUpdatePhoneNumberBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updatePhoneNumber.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      code: data.otp,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(
          this.i18n.t("errors.user.not_found", {
            lang: I18nContext.current()?.lang,
          })
        );
      else if (
        error.constructor == InvalidOTPCodeError ||
        error.constructor == NotAllowedError
      )
        throw new BadRequestException(
          this.i18n.t("errors.authenticate.otp.invalid_file_type", {
            lang: I18nContext.current()?.lang,
          })
        );
      else throw new BadRequestException(error.message);
    }
  }
}
