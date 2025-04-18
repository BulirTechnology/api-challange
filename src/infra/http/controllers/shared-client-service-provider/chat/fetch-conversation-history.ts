import {
  Controller,
  BadRequestException,
  UseGuards,
  Param,
  Get,
  Query,
  Headers
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchConversationHistoryReasonUseCase } from "@/domain/work/application/use-case/booking/fetch-conversation-history";
import { z } from "zod";
/* import { MessagePresenter } from "../../../presenters/message.presenter"; */

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
  .default("1");

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type TitleQueryParamSchema = z.infer<typeof titleQueryParamSchema>

type QuerySearch = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
  title: TitleQueryParamSchema
}

@ApiTags("Bookings")
@Controller("/booking")
@UseGuards(JwtAuthGuard)
export class FetchConversationHistoryController {
  constructor(
    private fetchConversationHistory: FetchConversationHistoryReasonUseCase
  ) { }

  @Get(":bookingId/conversations")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string,
    @Query() query: QuerySearch,
  ) {
    const response = await this.fetchConversationHistory.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      bookingId,
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 1 : query.per_page,
      title: query.title
    });

    if (response.isLeft()) {
      throw new BadRequestException();
    }

    const meta = response.value.meta;

    return {
      /*       data: response.value?.data.map(item => MessagePresenter.toHTTP({
        ...item
      }, "")), */
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