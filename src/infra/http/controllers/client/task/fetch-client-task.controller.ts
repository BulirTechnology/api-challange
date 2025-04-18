import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
  UseGuards,
} from "@nestjs/common";

import { z } from "zod";

import { ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { TaskPresenter } from "../../../presenters/task-presenter";
import { FetchClientTasksUseCase } from "@/domain/work/application/use-case/tasks/fetch-client-task";
import { EnvService } from "@/infra/environment/env.service";
import { ResourceNotFoundError } from "@/core/errors";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .refine((value) => !isNaN(Number(value)), {
    message: "Invalid number format",
  })
  .transform(Number).pipe(
    z.number().min(1)
  );

const statusQueryParamSchema = z
  .enum(["OPEN", "CLOSED", "BOOKED", "ALL"])
  .default("ALL")
  .optional();

const titleQueryParamSchema = z
  .string()
  .default("")
  .optional();

const categoryIdQueryParamSchema = z
  .string()
  .optional();

const postDateQueryParamSchema = z
  .date()
  .optional();

const expectedDateDateQueryParamSchema = z
  .date()
  .optional();

const viewStateDateDateQueryParamSchema = z
  .enum(["PRIVATE", "PUBLIC", "ALL"])
  .optional();

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type StatusQueryParamSchema = z.infer<typeof statusQueryParamSchema>
type CategoryIdQueryParamSchema = z.infer<typeof categoryIdQueryParamSchema>
type PostDateQueryParamSchema = z.infer<typeof postDateQueryParamSchema>
type TitleDateQueryParamSchema = z.infer<typeof titleQueryParamSchema>
type ExpectedDateDateQueryParamSchema = z.infer<typeof expectedDateDateQueryParamSchema>
type ViewStateDateDateQueryParamSchema = z.infer<typeof viewStateDateDateQueryParamSchema>

type Query = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema,
  status: StatusQueryParamSchema,
  title: TitleDateQueryParamSchema,
  category_id: CategoryIdQueryParamSchema,
  post_date: PostDateQueryParamSchema,
  expected_date: ExpectedDateDateQueryParamSchema,
  view_state: ViewStateDateDateQueryParamSchema,
}
@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class FetchClientTaskController {
  constructor(
    private env: EnvService,
    private fetchClientTasksUseCase: FetchClientTasksUseCase
  ) { }

  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: Query
  ) {
    const queryTitle = query.title ?? "";

    const result = await this.fetchClientTasksUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      status: query.status ?? "ALL",
      categoryId: query.category_id,
      viewState: query.view_state ?? "ALL",
      title: queryTitle !== "undefined" ? query.title : "",
      userId: user.sub
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      tasks: result.value?.tasks.map(item => TaskPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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