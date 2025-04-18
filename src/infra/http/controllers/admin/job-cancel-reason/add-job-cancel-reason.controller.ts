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
import { AddJobCancelReasonUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/add-cancel-delete-reason";
import { ValidationService } from "@/infra/http/pipes/validation.service";


const addJobCancelReasonBodySchema = z.object({
  value: z.string({
    invalid_type_error: "job_cancel.add_value.invalid_type_error",
    required_error: "job_cancel.add_value.required_error"
  }),
});

type AddJobCancelReasonBodySchema = z.infer<typeof addJobCancelReasonBodySchema>

@ApiTags("Reasons")
@Controller("/job")
@Public()
export class AddJobCancelReasonController {
  constructor(
    private addJobCancelReason: AddJobCancelReasonUseCase,
    private validation: ValidationService
  ) { }

  @Post("reasons")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: AddJobCancelReasonBodySchema
  ) {
    try {
      await this.validation.validateData(addJobCancelReasonBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addJobCancelReason.execute({
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