import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { ApiTags } from "@nestjs/swagger";
import { Public } from "@/infra/auth/public";
import { TaskDeleteReasonPresenter } from "../../../presenters/task-delete-reason-presenter";
import { FetchTaskDeleteReasonUseCase } from "@/domain/work/application/use-case/tasks/fetch-task-delete-reason";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );
const nameQueryParamSchema = z.string().optional();

type NameQueryParamSchema = z.infer<typeof nameQueryParamSchema>
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  name: NameQueryParamSchema,
  per_page: PageQueryParamSchema
}

@ApiTags("Reasons")
@Controller("/tasks")
@Public()
export class FetchRecentTaskDeleteReasonController {
  constructor(
    private fetchTaskDeleteReason: FetchTaskDeleteReasonUseCase) { }

  @Get("delete-reason")
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchTaskDeleteReason.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page,
      perPage: query.per_page ? query.per_page : 10,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.data.map(TaskDeleteReasonPresenter.toHTTP),
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