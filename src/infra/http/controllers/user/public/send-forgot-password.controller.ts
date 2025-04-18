import {
  Body,
  Controller,
  Patch,
  NotFoundException,
  BadRequestException,
  Headers,
} from "@nestjs/common";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import { ApiTags, ApiResponse } from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { SendForgotPasswordMailUseCase } from "@/domain/users/application/use-cases/user/send-forgot-password-mail";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const sendForgotPasswordMailBodySchema = z.object({
  email: z
    .string({
      invalid_type_error: "user.email.invalid_type_error",
      required_error: "user.email.invalid_type_error",
    })
    .email({
      message: "Informe um e-mail valido",
    })
    .optional(),
  resetToken: z.string({
    invalid_type_error: "authenticate.resetToken.invalid_type_error",
    required_error: "authenticate.resetToken.invalid_type_error",
  }),
  newPassword: z.string({
    invalid_type_error: "user.new_password.invalid_type_error",
    required_error: "user.new_password.invalid_type_error",
  }),
});

type SendForgotPasswordMailBodySchema = z.infer<
  typeof sendForgotPasswordMailBodySchema
>;

@ApiTags("Users")
@Controller("/users")
export class SendForgotPasswordMailController {
  constructor(
    private sendForgotPasswordMail: SendForgotPasswordMailUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) {}

  @Patch("update-password")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: SendForgotPasswordMailBodySchema
  ) {
    try {
      await this.validation.validateData(
        sendForgotPasswordMailBodySchema,
        data
      );
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.sendForgotPasswordMail.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      email: data?.email,
      resetToken: data.resetToken,
      newPassword: data.newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(
          this.i18n.t("errors.user.not_found", {
            lang: I18nContext.current()?.lang,
          })
        );
      else throw new BadRequestException(error.message);
    }

    return result.value;
  }
}
