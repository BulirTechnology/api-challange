import {
  Controller,
  BadRequestException,
  UseGuards,
  Get,
  Query,
  Headers,
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";

import { z } from "zod";
import { NotificationPresenter } from "../../../presenters/notification-presenter";
import { FetchUserNotificationsUseCase } from "@/domain/users/application/use-cases/user/notification/fetch-user-notifications";

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

const titleQueryParamSchema = z
  .string()
  .optional()
  .default("");

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type TitleQueryParamSchema = z.infer<typeof titleQueryParamSchema>

type Query = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
  title: TitleQueryParamSchema
}

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class FetchUserNotificationsController {
  constructor(
    private userNotification: FetchUserNotificationsUseCase
  ) { }

  @Get("notifications")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: Query
  ) {
    const result = await this.userNotification.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      userId: user.sub, 
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      notifications: result.value?.notifications.map(NotificationPresenter.toHTTP),
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