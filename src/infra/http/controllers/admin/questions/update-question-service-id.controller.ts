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
import { UpdateQuestionServiceUseCase } from "@/domain/work/application/use-case/categories/questions/update-question-service";
import { I18nContext, I18nService } from "nestjs-i18n";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateQuestionServiceBodySchema = z.object({
  service_id: z.string({
    invalid_type_error: "question.service_id.invalid_type_error",
    required_error: "question.service_id.invalid_type_error"
  }),
});

type UpdateQuestionServiceBodySchema = z.infer<typeof updateQuestionServiceBodySchema>

@ApiTags("Users")
@Controller("/questions")
export class UpdateQuestionServiceController {
  constructor(
    private updateQuestionService: UpdateQuestionServiceUseCase,
    private readonly i18n: I18nService,
    private validation: ValidationService
  ) { }

  @Put(":questionId/service")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("questionId") questionId: string,
    @Body() data: UpdateQuestionServiceBodySchema
  ) {
    try {
      await this.validation.validateData(updateQuestionServiceBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateQuestionService.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      questionId,
      serviceId: data.service_id,
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