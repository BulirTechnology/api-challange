import {
  Body,
  Controller,
  BadRequestException,
  Put,
  Param,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { UpdateServiceProviderStateUseCase } from "@/domain/users/application/use-cases/service-provider/details/update-service-provider-state";

import {
  ApiTags
} from "@nestjs/swagger";

import { I18nService } from "nestjs-i18n";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { Public } from "@/infra/auth/public";

const updateServiceProviderStateBodySchema = z.object({
  state: z.enum(["Inactive", "SetupAccount", "UnderReview"])
});

type UpdateServiceProviderStateBodySchema = z.infer<typeof updateServiceProviderStateBodySchema>

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@Public()
export class UpdateServiceProviderStateController {
  constructor(
    private updateServiceProviderState: UpdateServiceProviderStateUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put(":serviceProviderId/state")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("serviceProviderId") serviceProviderId: string,
    @Body() data: UpdateServiceProviderStateBodySchema,
  ) {
    try {
      await this.validation.validateData(updateServiceProviderStateBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.updateServiceProviderState.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      serviceProviderId,
      state: data.state
    });

    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }
  }
}