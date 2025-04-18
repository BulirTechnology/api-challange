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
import { FetchClientJobsUseCase } from "@/domain/work/application/use-case/jobs/fetch-client-jobs";
import { ClientJobPresenter } from "@/infra/http/presenters/job-presenter";
import { EnvService } from "@/infra/environment/env.service";

const pageQueryParamSchema = z.string().optional().default("1").transform(Number).pipe(
  z.number().min(1)
);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QuerySearch = {
  page: PageQueryParamSchema,
  title: string,
  status_open: boolean,
  status_closed: boolean,
  status_booked: boolean,
  view_state_public: boolean,
  view_state_private: boolean,
  category_id: string,
  posted_date: string,
  expected_date: string,
  per_page: PageQueryParamSchema
}

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class FetchJobsController {
  constructor(
    private env: EnvService,
    private fetchClientJobs: FetchClientJobsUseCase
  ) { }

  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QuerySearch
  ) {
    const {
      category_id,
      page,
      title,
      expected_date,
      posted_date,
      status_booked,
      status_closed,
      status_open,
      view_state_private,
      view_state_public,
      per_page
    } = query;

    const result = await this.fetchClientJobs.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(page) ? 1 : page,
      perPage: isNaN(per_page) ? 10 : per_page,
      userId: user.sub,
      title,
      statusOpen: status_open ? status_open == true || status_open == "true" ? true : false : true,
      statusBooked: status_booked ? status_booked == true || status_booked == "true" ? true : false : true,
      statusClosed: status_closed ? status_closed == true || status_closed == "true" ? true : false : true,
      categoryId: category_id,
      postedDate: posted_date,
      expectedDate: expected_date,
      viewStatePrivate: view_state_private ? view_state_private == true || view_state_private == "true" ? true : false : true,
      viewStatePublic: view_state_public ? view_state_public == true || view_state_public == "true" ? true : false : true,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      jobs: result.value?.jobs.map(item => ClientJobPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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