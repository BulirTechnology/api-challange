import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";

import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SetupFirstSpecializationToServiceProviderUseCase } from "@/domain/users/application/use-cases/service-provider/register/setup-first-specification-to-service-provider";
import { ResourceNotFoundError } from "@/core/errors";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { EnvService } from "@/infra/environment/env.service";
import { ServiceProviderPresenter } from "@/infra/http/presenters/service-provider-presenter";
import { SpecializationPresenter } from "@/infra/http/presenters/specialization-presenter";

const specificationSchema = z.object({
  service_id: z.string({
    invalid_type_error: "specialization.service_id.invalid_type_error",
    required_error: "specialization.service_id.invalid_type_error"
  }),
  price: z.number({
    invalid_type_error: "specialization.price.invalid_type_error",
    required_error: "specialization.price.invalid_type_error"
  }),
  rate: z.enum(["FIXED", "HOURLY"], {
    invalid_type_error: "specialization.rate.invalid_type_error",
    required_error: "specialization.rate.invalid_type_error"
  }),
});
const setupSpecializationProviderPasswordBodySchema = z.object({
  specializations: z.array(specificationSchema),
});

type SetupFirstSpecializationToServiceProviderBodySchema = z.infer<typeof setupSpecializationProviderPasswordBodySchema>

@ApiTags("Service Providers")
@Controller("/service-providers")
@Public()
export class SetupFirstSpecializationServiceProviderController {
  constructor(
    private env: EnvService,
    private specificationUseCase: SetupFirstSpecializationToServiceProviderUseCase,
    private validation: ValidationService
  ) { }

  @Post(":serviceProviderId/setup-specification")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        password: {
          type: "string",
          description: "The new user password",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successful response. The password was updated with success",
    schema: {
      properties: {
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "Error response. User not found",
    schema: {
      properties: {
        message: {
          type: "string",
          description: "The main message error"
        },
        errors: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: "Error response. There is an error in the body property",
    schema: {
      properties: {
        message: {
          type: "string",
          description: "The main message error"
        },
        errors: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("serviceProviderId") serviceProviderId: string,
    @Body() data: SetupFirstSpecializationToServiceProviderBodySchema
  ) {
    try {
      await this.validation.validateData(setupSpecializationProviderPasswordBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.specificationUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      specializations: data.specializations.map(item => ({
        price: item.price,
        rate: item.rate,
        serviceId: item.service_id,

      })),
      serviceProviderId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException(error.message);
    }

    return {
      message: result.value.message,
      next_step: result.value.nextStep,
      service_provider: ServiceProviderPresenter.toHTTP(result.value.serviceProvider, this.env.get("STORAGE_URL")),
      specifications: result.value.specializations.map(item => SpecializationPresenter.toHTTP(item, this.env.get("STORAGE_URL")))
    };
  }

}