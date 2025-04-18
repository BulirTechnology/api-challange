import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { EnvService } from "@/infra/environment/env.service";
import { ResourceNotFoundError } from "@/core/errors";
import { FetchClientServiceProviderDetailsUseCase } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-details";
import { ClientServiceProviderPresenter } from "@/infra/http/presenters/client-service-provider-presenter";

@ApiTags("Clients")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class FetchClientServiceProviderDetailsController {
  constructor(
    private env: EnvService,
    private fetchServiceProviderDetails: FetchClientServiceProviderDetailsUseCase
  ) { }

  @Get("service-providers/:serviceProviderId")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("serviceProviderId") serviceProviderId: string
  ) {
    const result = await this.fetchServiceProviderDetails.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      serviceProviderId,
      userId: user.sub
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }

    return {
      data: ClientServiceProviderPresenter.toHTTP(result.value.data, this.env.get("STORAGE_URL")),
    };
  }

}