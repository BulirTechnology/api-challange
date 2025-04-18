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
import { FetchCreditPackageUseCase } from "@/domain/subscriptions/applications/use-cases/credit-package/fetch-credit-package";
import { CreditPackagePresenter } from "@/infra/http/presenters/credit-package-presenter";

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

const statusQueryParamSchema = z
  .enum(["INACTIVE", "ACTIVE", "DRAFT", "ALL",])
  .default("ALL")
  .optional();

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type PerPageQueryParamSchema = z.infer<typeof perPageQueryParamSchema>
type StatusQueryParamSchema = z.infer<typeof statusQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  per_page: PerPageQueryParamSchema
  status: StatusQueryParamSchema
}

@ApiTags("Credit Package")
@Controller("/credit-packages")
@Public()
export class FetchCreditPackageController {
  constructor(
    private fetchCreditPackage: FetchCreditPackageUseCase) { }

  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchCreditPackage.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page ? query.page : 1,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      status: query.status ?? "ALL",
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.data.map(CreditPackagePresenter.toHTTP),
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