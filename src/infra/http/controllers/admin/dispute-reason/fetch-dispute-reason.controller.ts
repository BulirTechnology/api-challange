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
import { FetchFileDisputeReasonUseCase } from "@/domain/work/application/use-case/booking/fetch-file-dispute-reason";
import { FileDisputeReasonPresenter } from "@/infra/http/presenters/file-dispute-reason-presenter";

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
@Controller("/disputes")
@Public()
export class FetchFileDisputeReasonController {
  constructor(
    private fetchFileDisputeReason: FetchFileDisputeReasonUseCase) { }

  @Get("reasons")
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchFileDisputeReason.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page ? query.page : 1,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
    
    const meta = result.value.meta;

    return {
      data: result.value?.data.map(FileDisputeReasonPresenter.toHTTP),
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