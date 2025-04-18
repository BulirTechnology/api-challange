import {
  Controller,
  Post,
  Param,
  Body,
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
import { ResourceNotFoundError } from "@/core/errors";
import { RequestUpdatePhoneNumberUseCase } from "@/domain/users/application/use-cases/user/public/request-update-phone-number";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const requestUpdatePhoneNumberBodySchema = z.object({
  phone_number: z.string({
    invalid_type_error: "user.phone_number.invalid_type_error",
    required_error: "user.phone_number.invalid_type_error"
  })
});

type RequestUpdatePhoneNumberBodySchema = z.infer<typeof requestUpdatePhoneNumberBodySchema>

@ApiTags("Users")
@Controller("/users")
export class RequestUpdatePhoneNumberController {
  constructor(
    private requestUpdatePhoneNumber: RequestUpdatePhoneNumberUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post(":id/request-phone-update-otp")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("userId") userId: string,
    @Body() data: RequestUpdatePhoneNumberBodySchema
  ) {
    try {
      await this.validation.validateData(requestUpdatePhoneNumberBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.requestUpdatePhoneNumber.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId,
      phoneNumber: data.phone_number
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