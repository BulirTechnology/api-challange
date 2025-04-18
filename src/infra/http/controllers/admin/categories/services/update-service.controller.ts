import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  Post,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import { ApiTags } from "@nestjs/swagger";


import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { UpdateServiceUseCase } from "@/domain/work/application/use-case/categories/services/update-service";

const servicesBodySchema = z.object({
  title: z.string({
    invalid_type_error: "errors.services.invalid_type_error",
    required_error: "errors.services.required_error"
  }),
});

type ServicesBodySchema = z.infer<typeof servicesBodySchema>

@ApiTags("Categories")
@Controller("/services")
@Public()
export class UpdateServiceController {
  constructor(
    private updateService: UpdateServiceUseCase,
    private validation: ValidationService
  ) { }

  @Post(":serviceId")
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: ServicesBodySchema,
    @Param("serviceId") serviceId: string
  ) {
    try {
      await this.validation.validateData(servicesBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateService.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      serviceId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}