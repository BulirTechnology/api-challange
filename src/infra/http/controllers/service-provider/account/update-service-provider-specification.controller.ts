import {
  Body,
  Controller,
  BadRequestException,
  Param,
  Put,
  UseGuards,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { UpdateServiceProviderSpecializationUseCase } from "@/domain/users/application/use-cases/service-provider/specialization/update-service-provider-specialization";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateServiceProviderSpecializationBodySchema = z.object({
  title: z.string({
    invalid_type_error: "specialization.title.invalid_type_error",
    required_error: "specialization.title.invalid_type_error"
  }),
  price: z.number({
    invalid_type_error: "specialization.price.invalid_type_error",
    required_error: "specialization.price.invalid_type_error"
  }),
  serviceId: z.string({
    invalid_type_error: "specialization.service_id.invalid_type_error",
    required_error: "specialization.service_id.invalid_type_error"
  }),
  rate: z.enum(["FIXED", "HOURLY"], {
    invalid_type_error: "specialization.rate.invalid_type_error",
    required_error: "specialization.rate.invalid_type_error"
  })
});

type UpdateServiceProviderSpecializationBodySchema = z.infer<typeof updateServiceProviderSpecializationBodySchema>

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class UpdateServiceProviderSpecializationController {
  constructor(
    private updateServiceProviderSpecialization: UpdateServiceProviderSpecializationUseCase,
    private validation: ValidationService
  ) { }

  @Put("specialization/:specializationId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("specializationId") specializationId: string,
    @Body() data: UpdateServiceProviderSpecializationBodySchema
  ) {
    try {
      await this.validation.validateData(updateServiceProviderSpecializationBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.updateServiceProviderSpecialization.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      title: data.title,
      price: data.price,
      rate: data.rate,
      serviceId: data.serviceId,
      id: specializationId
    });

    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }

    return {
      next_step: response.value.nextStep ?? undefined
    };
  }
}