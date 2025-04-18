import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";

import { z } from "zod";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchServiceProviderNearJobsUseCase } from "@/domain/work/application/use-case/jobs/fetch-service-provider-near-jobs";
import { JobPresenter } from "@/infra/http/presenters/job-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { GetJobsNotViewedUseCase } from "@/domain/work/application/use-case/jobs/get-jobs-not-viewed";

const pageQueryParamSchema = z.string().optional().default("1").transform(Number).pipe(
  z.number().min(1)
);
const priceSortQueryParamSchema = z.enum(["HighToLow", "LowToHight"]).optional().default("HighToLow");
const viewStateQueryParamSchema = z.enum(["PUBLIC", "PRIVATE"]).optional().default("PUBLIC");
const ratingQueryParamSchema = z.enum(["1", "2", "3", "4", "5"]).optional().default("5");

type PriceSortQueryParamSchema = z.infer<typeof priceSortQueryParamSchema>
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type ViewStateQueryParamSchema = z.infer<typeof viewStateQueryParamSchema>
type RatingQueryParamSchema = z.infer<typeof ratingQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  price_sort: PriceSortQueryParamSchema,
  service_id: string,
  subcategory_id: string
  category_id: string
  posted_date: string, // in format of YYYY-MM-DD
  expected_date: string, // in format of YYYY-MM-DD
  view_state: ViewStateQueryParamSchema
  latitude: number
  longitude: number
  rating: RatingQueryParamSchema
  title: string
}

@ApiTags("Jobs")
@Controller("/service-providers")
export class FetchServiceProviderNearJobsController {
  constructor(
    private env: EnvService,
    private fetchServiceProviderJobs: FetchServiceProviderNearJobsUseCase,
    private getJobsNotViewed: GetJobsNotViewedUseCase
  ) { }

  @Get("jobs")
  @UseGuards(JwtAuthGuard)
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QueryParams,
  ) {
    const {
      page,
      price_sort,
      service_id,
      category_id,
      posted_date,
      expected_date,
      view_state,
      latitude,
      longitude,
      rating,
      title
    } = query;

    const result = await this.fetchServiceProviderJobs.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(page) ? 1 : page,
      userId: user.sub,
      priceSort: price_sort,
      serviceId: service_id,
      categoryId: category_id,
      postedDate: posted_date,
      expectedDate: expected_date,
      viewState: view_state,
      latitude,
      longitude,
      rating,
      title
    });
    const jobNotViewed = await this.getJobsNotViewed.execute({
      userId: user.sub,

    });
    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      jobs: result.value?.jobs.map(item => JobPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
      job_not_viewed: jobNotViewed,
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