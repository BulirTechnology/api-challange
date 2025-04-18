import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { FetchSubSubCategoriesUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/fetch-sub-sub-categories";
import { ApiTags } from "@nestjs/swagger";
import { SubSubCategoryPresenter } from "../../../../presenters/sub-sub-category-presenter";
import { EnvService } from "@/infra/environment/env.service";
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
export class FetchRecentSubSubCategoryController {
  constructor(
    private env: EnvService,
    private fetchCategories: FetchSubSubCategoriesUseCase
  ) { }

  @Get(":subcategoryId/sub_subcategories")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("subcategoryId") subCategoryId: string,
    @Query() query: QueryParamsSchema
  ) {
    const result = await this.fetchCategories.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      subCategoryId,
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.subSubCategories.map(item => SubSubCategoryPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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