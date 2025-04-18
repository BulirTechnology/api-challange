import {
  Body,
  Controller,
  Post,
  NotFoundException,
  BadRequestException,
  Headers,
} from "@nestjs/common";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { ResendOtpCodeUseCase } from "@/domain/users/application/use-cases/user/resend-otp-code";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const resendEmailOtpBodySchema = z.object({
  account_type: z.enum(["Client", "ServiceProvider"]),
  email: z.string({
    invalid_type_error: "user.email.invalid_type_error",
    required_error: "user.email.invalid_type_error"
  }).email({
    message: "Informe um e-mail valido"
  })
});

type ResendEmailOtpBodySchema = z.infer<typeof resendEmailOtpBodySchema>

@ApiTags("Users")
@Controller("/users")
export class ResendEmailOtpController {
  constructor(
    private resendOtpCode: ResendOtpCodeUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post("resend-email-otp")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: ResendEmailOtpBodySchema
  ) {
    try {
      await this.validation.validateData(resendEmailOtpBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.resendOtpCode.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      email: data.email,
      accountType: data.account_type,
      verificationFor: "Email"
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}