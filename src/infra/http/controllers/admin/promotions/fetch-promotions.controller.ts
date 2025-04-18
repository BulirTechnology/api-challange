import {
  BadRequestException,
  Controller, 
  Get,
  Headers,
  Query,
  UsePipes
} from "@nestjs/common";

import { z } from "zod";

import { PromotionPresenter } from "../../../presenters/promotion-presenter";
import { FetchPromotionsUseCase } from "@/domain/work/application/use-case/promotion/fetch-promotions";
import { ApiTags } from "@nestjs/swagger";
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

type QueryParams = {
  page: PageQueryParamSchema,
  per_page: PerPageQueryParamSchema
}

@ApiTags("Promotions")
@Controller("/promotions")
@Public()
//use admin route
export class FetchRecentPromotionController {
  constructor(private fetchPromotions: FetchPromotionsUseCase) { }

  @Get()
  @UsePipes()
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchPromotions.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page ? query.page : 1,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      promotions: result.value?.promotions.map(PromotionPresenter.toHTTP),
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