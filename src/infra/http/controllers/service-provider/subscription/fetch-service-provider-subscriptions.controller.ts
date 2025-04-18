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
import { ResourceNotFoundError } from "@/core/errors";

import { z } from "zod";
import { ServiceProviderSubscriptionPresenter } from "@/infra/http/presenters/subscription-plan-presenter";
import { FetchServiceProviderSubscriptionsUseCase } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-service-provider-subscriptions";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema
}

@ApiTags("Subscriptions")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class FetchServiceProviderSubscriptionsController {
  constructor(
    private fetchServiceProviderSubscriptions: FetchServiceProviderSubscriptionsUseCase
  ) { }

  @Get("subscriptions")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchServiceProviderSubscriptions.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      page: query.page,
      status: "ACTIVE"
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }

    return {
      data: result.value.data.map(ServiceProviderSubscriptionPresenter.toHTTP),
    };
  }

}