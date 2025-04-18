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
import { FetchJobCancelReasonUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/fetch-job-cancel-reason";
import { JobCancelReasonPresenter } from "@/infra/http/presenters/job-cancel-reason-presenter";

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

@ApiTags("Reasons")
@Controller("/job")
@Public()
export class FetchJobCancelReasonController {
  constructor(
    private fetchJobCancelReason: FetchJobCancelReasonUseCase) { }

  @Get("reasons")
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchJobCancelReason.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      data: result.value?.data.map(JobCancelReasonPresenter.toHTTP),
      meta: {
        total: 0,
        lastPage: 0,
        currentPage: 0,
        perPage: 0,
        prev: null,
        next: null,
      }
    };
  }

}