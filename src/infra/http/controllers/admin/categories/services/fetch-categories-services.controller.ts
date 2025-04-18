import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { ApiTags } from "@nestjs/swagger";
import { ServicePresenter } from "../../../../presenters/service-presenter";
import { Public } from "@/infra/auth/public";
import { FetchServicesByCategoryUseCase } from "@/domain/work/application/use-case/categories/services/fetch-services-by-category";

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

type QueryParamsSchema = {
  page: PageQueryParamSchema,
  per_page: PerPageQueryParamSchema
}

@ApiTags("Categories")
@Controller("/categories")
@Public()
export class FetchCategoryServicesController {
  constructor(private fetchServicesByCategory: FetchServicesByCategoryUseCase) { }

  @Get(":categoryId/services")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("categoryId") categoryId: string,
    @Query() query: QueryParamsSchema
  ) {
    const result = await this.fetchServicesByCategory.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      categoryId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.services.map(ServicePresenter.toHTTP),
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