import {
  Controller,
  BadRequestException,
  Param,
  NotFoundException,
  UseGuards,
  Body,
  Put,
  Headers,
  Get
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { FetchSingleClientTask } from "@/domain/work/application/use-case/tasks/fetch-task";
import { RolesGuard } from "@/infra/auth/role.guard";
import { Roles } from "@/infra/auth/decorators/role.decorator";
import { Role } from "@/infra/auth/enums/role.enum";

const tasksImageFieldBodySchema = z.object({
  fields: z.array(z.enum(["image1", "image2", "image3", "image4", "image5", "image6"])),
});

type TasksImageBodySchema = z.infer<typeof tasksImageFieldBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeleteTaskTaskImageController {
  constructor(
    private taskRepository: FetchSingleClientTask,
    private validation: ValidationService
  ) { }

  @Get(":taskId")
  @Roles(Role.SUPER_ADMIN, Role.CLIENT)
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
  ) {
    
    const response = await this.taskRepository.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      taskId
    })

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}