import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { OtpValidationUseCase } from "@/domain/users/application/use-cases/user/otp-validation";
import { InvalidOTPCodeError } from "@/domain/users/application/use-cases/errors/invalid-otp-code-error";
import { ResourceNotFoundError } from "@/core/errors";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const validationEmailBodySchema = z.object({
  otp: z.string({
    invalid_type_error: "authenticate.otp.invalid_type_error",
    required_error: "authenticate.otp.invalid_type_error"
  }).length(4, {
    message: "authenticate.otp.valid"
  }),
  account_type: z.enum(["Client", "ServiceProvider"]),
  email: z.string({
    invalid_type_error: "user.email.invalid_type_error",
    required_error: "user.email.invalid_type_error"
  }).email({
    message: "Informe um e-mail valido"
  }),
});

type ValidationEmailBodySchema = z.infer<typeof validationEmailBodySchema>

@ApiTags("Users")
@Controller("/users")
export class ValidateEmailController {
  constructor(
    private otpValidation: OtpValidationUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post("validate-email")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: ValidationEmailBodySchema
  ) {
    try {
      await this.validation.validateData(validationEmailBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.otpValidation.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      code: data.otp,
      email: data.email,
      accountType: data.account_type,
      verificationFor: "Email"
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);
      else if (error.constructor == InvalidOTPCodeError)
        throw new BadRequestException(this.i18n.t("errors.authenticate.otp.invalid_file_type", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}