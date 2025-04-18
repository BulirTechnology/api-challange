import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query
} from "@nestjs/common";
import { z } from "zod";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { CategoryPresenter } from "../../../../presenters/category-presenter";
import { FetchCategoriesUseCase } from "@/domain/work/application/use-case/categories/category/fetch-categories";
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

type QueryParamsSchema = {
  page: PageQueryParamSchema,
  per_page: PerPageQueryParamSchema
}

@ApiTags("Categories")
@Controller("/categories")
@Public()
export class FetchRecentCategoryController {
  constructor(
    private env: EnvService,
    private fetchCategories: FetchCategoriesUseCase
  ) { }

  @Get()
  @ApiResponse({
    status: 200,
    description: "Successful response.",
    schema: {
      properties: {
        categories: {
          type: "array",
          properties: {
            id: {
              type: "string"
            },
            title: {
              type: "string"
            },
            url: {
              type: "string"
            },
            created_at: {
              type: "Date"
            },
            updated_at: {
              type: "Date"
            }
          },
          example: []
        }
      }
    }
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParamsSchema
  ) {
    const result = await this.fetchCategories.execute({
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      language: headers["accept-language"] == "en" ? "en" : "pt"
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      categories: result.value?.categories.map(item => CategoryPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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