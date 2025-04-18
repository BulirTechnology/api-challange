import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { FetchActivitiesUseCase } from "@/domain/users/application/use-cases/user/activities/fetch-activities";
import { ActivityPresenter } from "@/infra/http/presenters/activity-presenter";
import { Public } from "@/infra/auth/public";

@ApiTags("Activity")
@Controller("/users")
@Public()
export class FetchActivitiesController {
  constructor(
    private fetchActivitiesUseCase: FetchActivitiesUseCase
  ) { }

  @Get("activities")
  async handle(
    @Query() query: {
      page?: number
      per_page?: number
      user_id?: string
    }
  ) {
    const result = await this.fetchActivitiesUseCase.execute({
      userId: query.user_id,
      page: query.page ?? 1,
      perPage: query.per_page ?? 10
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      data: result.value.result.data.map(ActivityPresenter.toHTTP),
      meta: {
        current_page: result.value.result.meta.currentPage,
        last_page: result.value.result.meta.lastPage,
        next: result.value.result.meta.next,
        per_page: result.value.result.meta.perPage,
        prev: result.value.result.meta.prev,
        total: result.value.result.meta.total
      }
    };
  }

}