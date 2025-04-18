import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
  /* UseGuards, */
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
/* import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator"; */
import { EnvService } from "@/infra/environment/env.service";
import { ServiceProviderPresenter } from "@/infra/http/presenters/service-provider-presenter";
import { ResourceNotFoundError } from "@/core/errors";
import { FetchServiceProvidersUseCase } from "@/domain/users/application/use-cases/client/fetch-service-providers";
import { z } from "zod";
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
  name: NameQueryParamSchema
  per_page: PageQueryParamSchema
}

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@Public()
export class FetchAllServiceProviderController {
  constructor(
    private env: EnvService,
    private fetchServiceProvider: FetchServiceProvidersUseCase
  ) { }

  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    /* @AuthenticatedUser() user: AuthPayload, */
    @Query() query: QueryParams
  ) {
    const result = await this.fetchServiceProvider.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      /* userId: user.sub, */
      page: query.page,
      name: query.name?.toLowerCase(),
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
      data: result.value.data.map(item => ServiceProviderPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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