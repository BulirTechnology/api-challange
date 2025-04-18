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
import { EnvService } from "@/infra/environment/env.service";
import { ConversationPresenter } from "@/infra/http/presenters/conversation-presenter";
import { FetchConversationsUseCase } from "@/domain/work/application/use-case/conversation/fetch-conversations";
 
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
  page: PageQueryParamSchema
  per_page: PageQueryParamSchema
  title: TitleQueryParamSchema
}

@ApiTags("Chat")
@Controller("/conversations")
@UseGuards(JwtAuthGuard)
export class FetchConversationController {
  constructor(
    private env: EnvService,
    private fetchConversationsUseCase: FetchConversationsUseCase
  ) { }
 
  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: Query,
  ) {
    const result = await this.fetchConversationsUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      userId: user.sub,
      title: query.title
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      conversations: result.value?.conversations.map(item => ConversationPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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