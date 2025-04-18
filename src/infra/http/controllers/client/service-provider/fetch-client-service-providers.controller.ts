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
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { EnvService } from "@/infra/environment/env.service";
import { ResourceNotFoundError } from "@/core/errors";
import { ClientServiceProviderPresenter } from "@/infra/http/presenters/client-service-provider-presenter";
import { FetchClientServiceProviderUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider";
import { z } from "zod";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );
const nameQueryParamSchema = z
  .string()
  .optional()
  .default("");

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type NameQueryParamSchema = z.infer<typeof nameQueryParamSchema>

type Query = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
  name: NameQueryParamSchema
}

@ApiTags("Clients")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class FetchClientServiceProviderController {
  constructor(
    private env: EnvService,
    private fetchServiceProvider: FetchClientServiceProviderUseCase
  ) { }

  @Get("service-providers")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: Query
  ) {
    const result = await this.fetchServiceProvider.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      name: query.name,
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value.data.map(item => ClientServiceProviderPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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