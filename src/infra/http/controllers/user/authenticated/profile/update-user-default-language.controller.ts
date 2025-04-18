import {
  Body,
  Controller,
  Put,
  BadRequestException,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { UpdateUserDefaultLanguageUseCase } from "@/domain/users/application/use-cases/user/update-user-default-language";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const updateUserDefaultLanguageBodySchema = z.object({
  language: z.enum(["PORTUGUESE", "ENGLISH"], {
    invalid_type_error: "user.language.invalid_type_error",
    required_error: "user.language.invalid_type_error",
  }),
});

type UpdateUserDefaultLanguageBodySchema = z.infer<typeof updateUserDefaultLanguageBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdateUserDefaultLanguageController {
  constructor(
    private updateUserDefaultLanguage: UpdateUserDefaultLanguageUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put("language")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: UpdateUserDefaultLanguageBodySchema
  ) {
    try {
      await this.validation.validateData(updateUserDefaultLanguageBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateUserDefaultLanguage.execute({
      userId: user.sub,
      language: data.language === "ENGLISH" ? "ENGLISH" : "PORTUGUESE"
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