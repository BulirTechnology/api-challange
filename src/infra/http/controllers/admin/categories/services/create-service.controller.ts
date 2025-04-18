import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateServiceUseCase } from "@/domain/work/application/use-case/categories/services/create-service";

import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { ServicePresenter } from "@/infra/http/presenters/service-presenter";

const servicesBodySchema = z.object({
  title: z.string({
    invalid_type_error: "errors.services.invalid_type_error",
    required_error: "errors.services.required_error"
  }),
  parent_id: z.string()
});

type ServicesBodySchema = z.infer<typeof servicesBodySchema>

@ApiTags("Categories")
@Controller("/services")
@Public()
export class CreateServiceController {
  constructor(
    private createService: CreateServiceUseCase,
    private validation: ValidationService
  ) { }

  @Post()
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        parent_id: {
          type: "string",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successful response. Service created with success",
    schema: {
      properties: {
        category: {
          type: "object",
          properties: {
          }
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
        statusCode: {
          type: "number",
        },
        error: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: ServicesBodySchema,
  ) {
    try {
      await this.validation.validateData(servicesBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.createService.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      parentId: data.parent_id
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      service: ServicePresenter.toHTTP(result.value.service)
    }
  }
}