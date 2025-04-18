import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Post,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import { ApiTags } from "@nestjs/swagger";
import { AddQuestionUseCase } from "@/domain/work/application/use-case/categories/questions/add-question";

import { z } from "zod";
import { QuestionPresenter } from "../../../presenters/question-presenter";
import { ResourceNotFoundError } from "@/core/errors";
import { EnvService } from "@/infra/environment/env.service";
import { I18nContext, I18nService } from "nestjs-i18n";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const questionBodySchema = z.object({
  service_id: z.string({
    invalid_type_error: "question.service_id.invalid_type_error",
    required_error: "question.service_id.invalid_type_error"
  }),
  title: z.string({
    invalid_type_error: "question.title.invalid_type_error",
    required_error: "question.title.invalid_type_error"
  }),
  type_question: z.enum(["SIMPLE", "SINGLE_SELECT", "SINGLE_SELECT_IMAGE", "SINGLE_NUMBER", "MULTIPLE_SELECT", "BOOLEAN"], {
    invalid_type_error: "question.type_question.invalid_type_error",
    required_error: "question.type_question.invalid_type_error"
  }),
  options: z.array(z.string({
    invalid_type_error: "question.option.invalid_type_error",
    required_error: "question.option.invalid_type_error"
  })).optional()
});

type QuestionBodySchema = z.infer<typeof questionBodySchema>

@ApiTags("Categories")
@Controller("/questions")
@Public()
export class AddQuestionController {
  constructor(
    private env: EnvService,
    private createQuestion: AddQuestionUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post()
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: QuestionBodySchema,
  ) {
    try {
      await this.validation.validateData(questionBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.createQuestion.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      serviceId: data.service_id,
      typeQuestion: data.type_question,
      options: data.options
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.services.not_found", {
          lang: I18nContext.current()?.lang
        }));

      throw new BadRequestException(error.message);
    }

    const { question } = result.value;

    return {
      question: QuestionPresenter.toHTTP(question, this.env.get("STORAGE_URL"))
    };
  }
}