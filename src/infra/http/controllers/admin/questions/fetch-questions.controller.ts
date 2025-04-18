import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { QuestionPresenter } from "../../../presenters/question-presenter";
import { FetchQuestionsUseCase } from "@/domain/work/application/use-case/categories/questions/fetch-questions";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "@/infra/auth/public";
import { EnvService } from "@/infra/environment/env.service";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );

const perPageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type PerPageQueryParamSchema = z.infer<typeof perPageQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  per_page: PerPageQueryParamSchema
}

@ApiTags("Categories")
@Controller("/services")
@Public()
export class FetchRecentQuestionController {
  constructor(
    private env: EnvService,
    private fetchQuestions: FetchQuestionsUseCase
  ) { }

  @Get(":serviceId/questions")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("serviceId") serviceId: string,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchQuestions.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page ? query.page : 1,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      serviceId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      questions: result.value?.questions.map(item => QuestionPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
      meta: {
        total: meta.total,
        last_page: meta.lastPage,
        current_page: meta.currentPage,
        per_page: meta.perPage,
        prev: meta.prev,
        next: meta.next,
      }
    };
  }

}