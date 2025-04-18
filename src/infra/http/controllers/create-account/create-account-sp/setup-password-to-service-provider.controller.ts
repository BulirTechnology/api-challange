import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Patch,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";

import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SetupServiceProviderPasswordUseCase } from "@/domain/users/application/use-cases/service-provider/register/setup-service-provider-password";
import { ResourceNotFoundError } from "@/core/errors";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { ServiceProviderPresenter } from "@/infra/http/presenters/service-provider-presenter";
import { EnvService } from "@/infra/environment/env.service";

const setupServiceProviderPasswordBodySchema = z.object({
  password: z.string({
    invalid_type_error: "user.password.invalid_type_error",
    required_error: "user.password.invalid_type_error"
  }),
});

type SetupServiceProviderPasswordBodySchema = z.infer<typeof setupServiceProviderPasswordBodySchema>

@ApiTags("Service Providers")
@Controller("/service-providers")
@Public()
export class SetupPasswordController {
  constructor(
    private env: EnvService,
    private setupPassword: SetupServiceProviderPasswordUseCase,
    private validation: ValidationService
  ) { }

  @Patch(":serviceProviderId/password")
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
    @Body() data: SetupServiceProviderPasswordBodySchema
  ) {
    try {
      await this.validation.validateData(setupServiceProviderPasswordBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.setupPassword.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      password: data.password,
      serviceProviderId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }

    return {
      message: result.value.message,
      next_step: result.value.nextStep,
      service_provider: ServiceProviderPresenter.toHTTP(result.value.serviceProvider, this.env.get("STORAGE_URL"))
    };
  }

}