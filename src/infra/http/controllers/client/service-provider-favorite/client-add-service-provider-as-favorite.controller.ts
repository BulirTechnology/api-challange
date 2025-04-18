import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Headers,
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AddClientServiceProviderFavoriteUseCase } from "@/domain/users/application/use-cases/client/add-client-service-provider-favorite";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const clientAddServiceProviderFavoriteBodySchema = z.object({
  service_provider_id: z.string({
    invalid_type_error: "favorite.service_provider_id.invalid_type_error",
    required_error: "favorite.service_provider_id.invalid_type_error"
  }),
});

type ClientAddServiceProviderFavoriteBodySchema = z.infer<typeof clientAddServiceProviderFavoriteBodySchema>

@ApiTags("Favorites")
@Controller("/favorites")
@UseGuards(JwtAuthGuard)
export class ClientAddServiceProviderFavoriteController {
  constructor(
    private clientAddServiceProviderFavorite: AddClientServiceProviderFavoriteUseCase,
    private validation: ValidationService,
  ) { }

  @Post()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: ClientAddServiceProviderFavoriteBodySchema
  ) {
    try {
      await this.validation.validateData(clientAddServiceProviderFavoriteBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.clientAddServiceProviderFavorite.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      serviceProviderId: data.service_provider_id
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }
  }
}