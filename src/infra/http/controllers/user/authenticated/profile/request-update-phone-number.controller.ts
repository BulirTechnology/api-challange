import {
  Controller,
  Post,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Body,
  Headers,
  ConflictException,
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthRequestUpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/auth/auth-request-update-phone-number";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";
import { AccountAlreadyExistsError } from "@/domain/users/application/use-cases/errors/account-already-exists-error";

const authRequestUpdatePhoneNumberBodySchema = z.object({
  phone_number: z.string({
    invalid_type_error: "user.phone_number.invalid_type_error",
    required_error: "user.phone_number.invalid_type_error"
  })
});

type AuthRequestUpdatePhoneNumberBodySchema = z.infer<typeof authRequestUpdatePhoneNumberBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AuthRequestUpdatePhoneNumberController {
  constructor(
    private requestUpdatePhoneNumber: AuthRequestUpdatePhoneNumberUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post("request-update-phone")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AuthRequestUpdatePhoneNumberBodySchema
  ) {
    try {
      await this.validation.validateData(authRequestUpdatePhoneNumberBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.requestUpdatePhoneNumber.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      phoneNumber: data.phone_number
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == AccountAlreadyExistsError)
        throw new ConflictException({
          field: error.field,
          message: error.message,
          error: "Conflict",
          status_code: 409
        });
      else if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}