import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

import { z } from "zod";

import { ApiTags } from "@nestjs/swagger";
import {
  FetchServiceProviderOfServiceUseCase
} from "@/domain/users/application/use-cases/user/fetch-service-provider-of-service";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ServiceProviderPresenter } from "@/infra/http/presenters/service-provider-presenter";
import { Public } from "@/infra/auth/public";
import { EnvService } from "@/infra/environment/env.service";

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

const perPageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type PerPageQueryParamSchema = z.infer<typeof perPageQueryParamSchema>

type QueryParamsSchema = {
  page: PageQueryParamSchema,
  per_page: PerPageQueryParamSchema
}

@ApiTags("Service Providers")
@Controller("/service-providers")
@Public()
export class FetchServiceProviderOfServiceController {
  constructor(
    private env: EnvService,
    private fetchServiceProviderOfService: FetchServiceProviderOfServiceUseCase
  ) { }
 
  @Get("services/:serviceId")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() _: AuthPayload,
    @Query() query: QueryParamsSchema,
    @Param("serviceId") serviceId: string
  ) {
    const result = await this.fetchServiceProviderOfService.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      serviceId,
    });
 
    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      service_providers: result.value?.serviceProviders.map(item => ServiceProviderPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
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