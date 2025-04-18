import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { UpdateTaskStartDateUseCase } from "@/domain/work/application/use-case/tasks/update-task-start-date";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateTaskStartDateBodySchema = z.object({
  start_date: z.string({
    invalid_type_error: "task.start_date.invalid_type_error",
    required_error: "task.start_date.invalid_type_error"
  }).datetime(),
});

type UpdateTaskStartDateBodySchema = z.infer<typeof updateTaskStartDateBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdateTaskStartDateController {
  constructor(
    private updateTaskStartDate: UpdateTaskStartDateUseCase,
    private validation: ValidationService
  ) { }

  @Post("/:taskId/start_date")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body() data: UpdateTaskStartDateBodySchema,
  ) {
    try {
      await this.validation.validateData(updateTaskStartDateBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateTaskStartDate.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      startDate: new Date(data.start_date),
      taskId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}