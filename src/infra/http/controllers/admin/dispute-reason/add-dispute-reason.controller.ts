import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { Public } from "@/infra/auth/public";
import { AddFileDisputeReasonUseCase } from "@/domain/work/application/use-case/booking/add-file-dispute-reason";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const addFileDisputeReasonBodySchema = z.object({
  value: z.string({
    invalid_type_error: "dispute.add_value.invalid_type_error",
    required_error: "dispute.add_value.required_error"
  }),
});

type AddFileDisputeReasonBodySchema = z.infer<typeof addFileDisputeReasonBodySchema>

@ApiTags("Reasons")
@Controller("/disputes")
@Public()
export class AddFileDisputeReasonController {
  constructor(
    private addFileDisputeReason: AddFileDisputeReasonUseCase,
    private validation: ValidationService
  ) { }

  @Post("reasons")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: AddFileDisputeReasonBodySchema
  ) {
    try {
      await this.validation.validateData(addFileDisputeReasonBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addFileDisputeReason.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      value: data.value,
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }
  }
}