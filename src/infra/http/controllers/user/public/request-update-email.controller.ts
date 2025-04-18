import {
  Controller,
  Post,
  Param,
  Body,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Headers,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { z } from "zod";
import { AccountAlreadyExistsError } from "@/domain/users/application/use-cases/errors/account-already-exists-error";
import { ResourceNotFoundError } from "@/core/errors";
import { RequestUpdateEmailUseCase } from "@/domain/users/application/use-cases/user/public/request-update-email";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const requestUpdateEmailBodySchema = z.object({
  email: z.string({
    invalid_type_error: "user.email.invalid_type_error",
    required_error: "user.email.invalid_type_error"
  }).email({ message: "Informe um e-mail valido" })
});

type RequestUpdateEmailBodySchema = z.infer<typeof requestUpdateEmailBodySchema>

@ApiTags("Users")
@Controller("/users")
export class RequestUpdateEmailController {
  constructor(
    private requestUpdateEmail: RequestUpdateEmailUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post(":id/request-email-update-otp")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("userId") userId: string,
    @Body() data: RequestUpdateEmailBodySchema
  ) {
    try {
      await this.validation.validateData(requestUpdateEmailBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.requestUpdateEmail.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId,
      email: data.email
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