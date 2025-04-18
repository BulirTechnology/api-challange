import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { UpdateTaskBaseInfoUseCase } from "@/domain/work/application/use-case/tasks/update-task-base-info";

import { z } from "zod";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { TaskPresenter } from "@/infra/http/presenters/task-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const tasksBodySchema = z.object({
  title: z.string({
    invalid_type_error: "task.title.invalid_type_error",
    required_error: "task.title.invalid_type_error"
  }),
  view_state: z.enum(["PUBLIC", "PRIVATE"], {
    invalid_type_error: "task.view_state.invalid_type_error",
    required_error: "task.view_state.invalid_type_error"
  }),
  description: z.string({
    invalid_type_error: "task.description.invalid_type_error",
    required_error: "task.description.invalid_type_error"
  }),
  price: z.number({
    invalid_type_error: "task.price.invalid_type_error",
    required_error: "task.price.invalid_type_error"
  }),
});

type TasksBodySchema = z.infer<typeof tasksBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdateTaskBaseInfoController {
  constructor(
    private env: EnvService,
    private updateTask: UpdateTaskBaseInfoUseCase,
    private validation: ValidationService
  ) { }
  @Put(":taskId")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: TasksBodySchema,
    @Param("taskId") taskId: string,
  ) {
    try {
      await this.validation.validateData(tasksBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateTask.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      viewState: data.view_state,
      title: data.title,
      description: data.description,
      price: data.price,
      taskId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }

    return {
      task: TaskPresenter.toHTTP(result.value.task, this.env.get("STORAGE_URL"))
    };
  }
}