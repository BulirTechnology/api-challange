import {
  Controller,
  BadRequestException,
  Param,
  NotFoundException,
  UseGuards,
  Body,
  Put,
  Headers
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { UserDeleteTaskImagesUseCase } from "@/domain/work/application/use-case/tasks/user-delete-task-image";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const tasksImageFieldBodySchema = z.object({
  fields: z.array(z.enum(["image1", "image2", "image3", "image4", "image5", "image6"])),
});

type TasksImageBodySchema = z.infer<typeof tasksImageFieldBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class DeleteTaskTaskImageController {
  constructor(
    private userDeleteTask: UserDeleteTaskImagesUseCase,
    private validation: ValidationService
  ) { }

  @Put(":taskId/delete_images")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body() data: TasksImageBodySchema,
  ) {
    try {
      await this.validation.validateData(tasksImageFieldBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.userDeleteTask.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      taskId,
      fields: data.fields
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}