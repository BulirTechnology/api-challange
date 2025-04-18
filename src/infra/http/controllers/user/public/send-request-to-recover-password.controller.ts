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
import { ApiTags, ApiResponse } from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { SendRequestToRecoverPasswordUseCase } from "@/domain/users/application/use-cases/user/send-request-to-recover-password";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const sendRequestToRecoverPasswordBodySchema = z.object({
  email: z
    .string({
      invalid_type_error: "user.email.invalid_type_error",
      required_error: "user.email.invalid_type_error",
    })
    .email({
      message: "Informe um e-mail valido",
    }),
  account_type: z.enum(["Client", "ServiceProvider", "SuperAdmin"], {
    invalid_type_error: "Informe um tipo de conta valido",
    required_error: "Informe o tipo de conta",
  }),
});

type SendRequestToRecoverPasswordBodySchema = z.infer<
  typeof sendRequestToRecoverPasswordBodySchema
>;

@ApiTags("Users")
@Controller("/users")
export class SendRequestToRecoverPasswordController {
  constructor(
    private sendRequestToRecoverPassword: SendRequestToRecoverPasswordUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) {}

  @Post("send-request-recover-password")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: SendRequestToRecoverPasswordBodySchema
  ) {
    try {
      await this.validation.validateData(
        sendRequestToRecoverPasswordBodySchema,
        data
      );
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.sendRequestToRecoverPassword.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      email: data.email,
      accountType: data.account_type,
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

    return result;
  }
}
