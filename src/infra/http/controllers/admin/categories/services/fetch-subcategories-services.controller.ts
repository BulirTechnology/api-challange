import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { FetchSubCategoryServicesUseCase } from "@/domain/work/application/use-case/categories/services/fetch-subcategory-services";
import { ApiTags } from "@nestjs/swagger";
import { ServicePresenter } from "../../../../presenters/service-presenter";
import { Public } from "@/infra/auth/public";

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
@Controller("/subcategories")
@Public()
export class FetchSubCategoryServicesController {
  constructor(private fetchServices: FetchSubCategoryServicesUseCase) { }

  @Get(":subCategoryId/services")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("subCategoryId") subCategoryId: string,
    @Query() query: QueryParamsSchema
  ) {
    const result = await this.fetchServices.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      subCategoryId
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