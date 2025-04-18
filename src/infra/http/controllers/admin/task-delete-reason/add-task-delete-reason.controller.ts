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
import { AddTaskDeleteReasonUseCase } from "@/domain/work/application/use-case/tasks/add-task-delete-reason";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const addTaskDeleteReasonBodySchema = z.object({
  value: z.string({
    invalid_type_error: "task.add_delete_reason.invalid_type_error",
    required_error: "task.add_delete_reason.invalid_type_error"
  }),
});

type AddTaskDeleteReasonBodySchema = z.infer<typeof addTaskDeleteReasonBodySchema>

@ApiTags("Reasons")
@Controller("/tasks")
@Public()
export class AddTaskDeleteReasonController {
  constructor(
    private addTaskDeleteReason: AddTaskDeleteReasonUseCase,
    private validation: ValidationService
  ) { }

  @Post("delete-reason")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: AddTaskDeleteReasonBodySchema
  ) {
    try {
      await this.validation.validateData(addTaskDeleteReasonBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addTaskDeleteReason.execute({
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