import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";

import { z } from "zod";
import { FetchSubscriptionPlansUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/fetch-subscription-plan";
import { SubscriptionPlanPresenter } from "@/infra/http/presenters/subscription-plan-presenter";
import { Public } from "@/infra/auth/public";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );
const nameQueryParamSchema = z.string().optional();

type NameQueryParamSchema = z.infer<typeof nameQueryParamSchema>
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  name: NameQueryParamSchema,
  per_page: PageQueryParamSchema
}

@ApiTags("Subscriptions")
@Controller("/subscriptions")
@Public()
export class FetchSubscriptionPlansController {
  constructor(
    private fetchServiceProvider: FetchSubscriptionPlansUseCase
  ) { }

  @Get("plans")
  async handle(
    @Headers() headers: Record<string, string>,
    /* @AuthenticatedUser() user: AuthPayload, */
    @Query() query: QueryParams
  ) {
    const result = await this.fetchServiceProvider.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: query.page,
      perPage: query.per_page ? query.per_page : 10,
      status: "ALL"
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value.data.map(SubscriptionPlanPresenter.toHTTP),
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