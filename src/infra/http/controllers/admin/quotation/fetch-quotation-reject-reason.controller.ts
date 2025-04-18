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

import { QuotationRejectReasonPresenter } from "@/infra/http/presenters/quotation-reject-reason-presenter";
import { FetchQuotationRejectReasonUseCase } from "@/domain/work/application/use-case/jobs/quotation-reject-reason/fetch-quotation-reject-reason";

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
@Controller("/quotation")
@Public()
export class FetchQuotationRejectReasonController {
  constructor(
    private fetchQuotationRejectReason: FetchQuotationRejectReasonUseCase) { }

  @Get("reject_reasons")
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchQuotationRejectReason.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page ? query.page : 1,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.data.map(QuotationRejectReasonPresenter.toHTTP),
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