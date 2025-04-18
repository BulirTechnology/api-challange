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
import { AddQuestionOptionsUseCase } from "@/domain/work/application/use-case/categories/questions/add-question-options";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const addQuestionOptionsBodySchema = z.object({
  options: z.array(z.string({
    invalid_type_error: "question.option.invalid_type_error",
    required_error: "question.option.invalid_type_error"
  }))
});

type AddQuestionOptionsBodySchema = z.infer<typeof addQuestionOptionsBodySchema>

@ApiTags("Users")
@Controller("/questions")
export class AddQuestionOptionsController {
  constructor(
    private addQuestionOptions: AddQuestionOptionsUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put(":id/options")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("id") questionId: string,
    @Body() data: AddQuestionOptionsBodySchema
  ) {
    try {
      await this.validation.validateData(addQuestionOptionsBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.addQuestionOptions.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      questionId,
      options: data.options,
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