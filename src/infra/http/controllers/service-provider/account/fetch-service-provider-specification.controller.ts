import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";

import { z } from "zod";

import { SpecializationPresenter } from "../../../presenters/specialization-presenter";
import { ApiTags } from "@nestjs/swagger";
import { FetchServiceProviderSpecializationsUseCase } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-service-provider-specializations";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { EnvService } from "@/infra/environment/env.service";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QuerySearch = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
}

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class FetchServiceProviderSpecializationController {
  constructor(
    private env: EnvService,
    private fetchServiceProviderSpecializations: FetchServiceProviderSpecializationsUseCase
  ) { }

  @Get("specialization")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QuerySearch
  ) {
    const result = await this.fetchServiceProviderSpecializations.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      userId: user.sub
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.data.map(item => SpecializationPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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