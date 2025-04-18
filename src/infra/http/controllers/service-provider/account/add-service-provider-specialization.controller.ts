import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UseGuards,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { AddServiceProviderSpecializationUseCase } from "@/domain/users/application/use-cases/service-provider/specialization/add-service-provider-specialization";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { SpecializationPresenter } from "@/infra/http/presenters/specialization-presenter";
import { EnvService } from "@/infra/environment/env.service";

const services = z.object({
  title: z.string({
    invalid_type_error: "specialization.title.invalid_type_error",
    required_error: "specialization.title.invalid_type_error"
  }),
  price: z.number({
    invalid_type_error: "specialization.price.invalid_type_error",
    required_error: "specialization.price.invalid_type_error"
  }),
  service_id: z.string({
    invalid_type_error: "specialization.service_id.invalid_type_error",
    required_error: "specialization.service_id.invalid_type_error"
  }),
  rate: z.enum(["FIXED", "HOURLY"], {
    invalid_type_error: "specialization.rate.invalid_type_error",
    required_error: "specialization.rate.invalid_type_error"
  })
});

const addServiceProviderSpecializationBodySchema = z.object({
  services: z.array(services)
});

type AddServiceProviderSpecializationBodySchema = z.infer<typeof addServiceProviderSpecializationBodySchema>

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class AddServiceProviderSpecializationController {
  constructor(
    private env: EnvService,
    private addServiceProviderSpecialization: AddServiceProviderSpecializationUseCase,
    private validation: ValidationService
  ) { }

  @Post("specialization")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AddServiceProviderSpecializationBodySchema
  ) {
    try {
      await this.validation.validateData(addServiceProviderSpecializationBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addServiceProviderSpecialization.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      services: data.services.map(item => ({
        price: item.price,
        rate: item.rate,
        serviceId: item.service_id,
        title: item.title
      })),
      userId: user.sub,
    });
    console.log("entrou aqui");
    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }

    return {
      message: "Updated",
      next_step: response.value.nextStep ?? undefined,
      specifications: response.value.specializations.map(item => SpecializationPresenter.toHTTP(item, this.env.get("STORAGE_URL")))
    };
  }
}