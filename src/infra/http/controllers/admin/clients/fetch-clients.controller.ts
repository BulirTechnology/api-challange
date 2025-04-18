import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { EnvService } from "@/infra/environment/env.service";
import { ResourceNotFoundError } from "@/core/errors";
import { z } from "zod";
import { Public } from "@/infra/auth/public";
import { ClientDefaultPresenter } from "@/infra/http/presenters/client-presenter";
import { FetchClientsUseCase } from "@/domain/users/application/use-cases/client/fetch-clients";

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

const nameQueryParamSchema = z.string().optional();

type NameQueryParamSchema = z.infer<typeof nameQueryParamSchema>
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type PerPageQueryParamSchema = z.infer<typeof perPageQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  name: NameQueryParamSchema
  per_page: PerPageQueryParamSchema
}

@ApiTags("Clients")
@Controller("/clients")
@Public()
export class FetchClientsController {
  constructor(
    private env: EnvService,
    private fetchClientsUseCase: FetchClientsUseCase
  ) { }

  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchClientsUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: "user.sub",
      page: query.page,
      name: query.name ? query.name : "",
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
      data: result.value.data.map(ClientDefaultPresenter.toHTTP),
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