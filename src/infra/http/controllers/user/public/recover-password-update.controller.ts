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
import { RecoverPasswordUpdateUseCase } from "@/domain/users/application/use-cases/user/recover-password-update";
import { ResourceNotFoundError } from "@/core/errors";
import { InvalidOTPCodeError } from "@/domain/users/application/use-cases/errors/invalid-otp-code-error";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const recoverPasswordUpdateBodySchema = z
  .object({
    otp: z
      .string({
        invalid_type_error: "authenticate.otp.invalid_type_error",
        required_error: "authenticate.otp.invalid_type_error",
      })
      .length(4, {
        message: "authenticate.otp.valid",
      })
      .optional(),
    resetPasswordtoken: z
      .string({
        invalid_type_error:
          "authenticate.resetPasswordtoken.invalid_type_error",
        required_error: "authenticate.resetPasswordtoken.invalid_type_error",
      })
      .optional(),
    account_type: z.enum(["Client", "ServiceProvider", "SuperAdmin"]),
    email: z
      .string({
        invalid_type_error: "user.email.invalid_type_error",
        required_error: "user.email.invalid_type_error",
      })
      .email({
        message: "Informe um e-mail valido",
      }),
    password: z.string({
      invalid_type_error: "user.password.invalid_type_error",
      required_error: "user.password.invalid_type_error",
    }),
  })
  .refine(
    (data) =>
      (data.otp && !data.resetPasswordtoken) ||
      (!data.otp && data.resetPasswordtoken),
    {
      message:
        "Body must contain either otp or resetPasswordtoken, but not both.",
      path: ["otp", "resetPasswordtoken"],
    }
  );

type RecoverPasswordUpdateBodySchema = z.infer<
  typeof recoverPasswordUpdateBodySchema
>;

@ApiTags("Users")
@Public()
@Controller("/users")
export class RecoverPasswordUpdateController {
  constructor(
    private recoverPasswordUpdateUseCase: RecoverPasswordUpdateUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) {}

  @Post("recover-password-update")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: RecoverPasswordUpdateBodySchema
  ) {
    try {
      await this.validation.validateData(recoverPasswordUpdateBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.recoverPasswordUpdateUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      otp: data.otp,
      resetPasswordtoken: data.resetPasswordtoken,
      email: data.email,
      accountType: data.account_type,
      password: data.password,
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);
      else if (error.constructor == InvalidOTPCodeError)
        throw new BadRequestException(
          this.i18n.t("errors.authenticate.otp.invalid_file_type", {
            lang: I18nContext.current()?.lang,
          })
        );
      else throw new BadRequestException(error.message);
    }
  }
}
