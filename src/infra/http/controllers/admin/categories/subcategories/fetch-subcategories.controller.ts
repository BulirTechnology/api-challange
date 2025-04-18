import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { FetchSubCategoriesUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/fetch-sub-categories";
import { ApiTags } from "@nestjs/swagger";
import { SubCategoryPresenter } from "../../../../presenters/sub-category-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { Public } from "@/infra/auth/public";

const pageQueryParamSchema = z.string().optional().default("1").transform(Number).pipe(
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
export class FetchRecentSubCategoryController {
  constructor(
    private env: EnvService,
    private fetchCategories: FetchSubCategoriesUseCase) { }

  @Get(":categoryId/subcategories")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("categoryId") categoryId: string,
    @Query() query: QueryParamsSchema
  ) {
    const result = await this.fetchCategories.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      categoryId,
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.subCategories.map(item => SubCategoryPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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