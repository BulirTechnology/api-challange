import {
  Body,
  Controller,
  Param,
  NotFoundException,
  BadRequestException,
  Headers,
  Put
} from "@nestjs/common";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { UpdateQuestionStateUseCase } from "@/domain/work/application/use-case/categories/questions/update-question-state";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const updateQuestionStateBodySchema = z.object({
  state: z.enum(["ACTIVE", "INACTIVE", "DRAFT"], {
    invalid_type_error: "question.state.invalid_type_error",
    required_error: "question.state.invalid_type_error"
  }),
});

type UpdateQuestionStateBodySchema = z.infer<typeof updateQuestionStateBodySchema>

@ApiTags("Users")
@Controller("/questions")
export class UpdateQuestionStateController {
  constructor(
    private updateQuestionState: UpdateQuestionStateUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService,
  ) { }

  @Put(":questionId/state")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("questionId") questionId: string,
    @Body() data: UpdateQuestionStateBodySchema
  ) {
    try {
      await this.validation.validateData(updateQuestionStateBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateQuestionState.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      questionId,
      state: data.state,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException({
          errors: {
            image: this.i18n.t("errors.question.image.not_found", {
              lang: I18nContext.current()?.lang
            })
          }
        });

      throw new BadRequestException(error.message);
    }
  }
}