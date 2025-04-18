import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";

import { PortfolioPresenter } from "../../../presenters/portfolio-presenter";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { EnvService } from "@/infra/environment/env.service";
import { FetchClientServiceProviderPortfoliosUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-portfolios";
import { z } from "zod";

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

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QuerySearch = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
}

@ApiTags("Clients")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class FetchClientServiceProviderPortfolioController {
  constructor(
    private env: EnvService,
    private fetchServiceProviderPortfolios: FetchClientServiceProviderPortfoliosUseCase
  ) { }

  @Get("service-providers/:serviceProviderId/portfolios")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("serviceProviderId") serviceProviderId: string,
    @Query() query: QuerySearch
  ) {
    const result = await this.fetchServiceProviderPortfolios.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      userId: user.sub,
      serviceProviderId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.data.map(item => PortfolioPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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