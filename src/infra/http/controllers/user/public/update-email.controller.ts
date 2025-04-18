import {
  Body,
  Controller,
  Param,
  Patch,
  NotFoundException,
  BadRequestException,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { InvalidOTPCodeError } from "@/domain/users/application/use-cases/errors/invalid-otp-code-error";
import { NotAllowedError } from "@/core/errors";
import { UpdateEmailUseCase } from "@/domain/users/application/use-cases/user/public/update-email";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const updateEmailBodySchema = z.object({
  user_id: z.string({
    invalid_type_error: "Informe o usuário",
    required_error: "Informe o usuário"
  }),
  otp: z.string({
    invalid_type_error: "authenticate.otp.invalid_type_error",
    required_error: "authenticate.otp.invalid_type_error"
  }).length(4, {
    message: "authenticate.otp.valid"
  }),
  email: z.string({
    invalid_type_error: "user.email.invalid_type_error",
    required_error: "user.email.invalid_type_error"
  }).email({
    message: "Informe um e-mail valido"
  })
});

type UpdateEmailBodySchema = z.infer<typeof updateEmailBodySchema>

@ApiTags("Users")
@Controller("/users")
export class UpdateEmailController {
  constructor(
    private updateEmail: UpdateEmailUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Patch(":id/update-email")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("id") userId: string,
    @Body() data: UpdateEmailBodySchema
  ) {
    try {
      await this.validation.validateData(updateEmailBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateEmail.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId,
      code: data.otp,
      email: data.email,
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