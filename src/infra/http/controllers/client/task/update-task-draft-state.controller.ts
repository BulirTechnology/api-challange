import {
  BadRequestException,
  Body,
  Controller,
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
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { UpdateTaskDraftStateUseCase } from "@/domain/work/application/use-case/tasks/update-task-draft-state";

const updateTaskDraftStateBodySchema = z.object({
  state: z.enum(["SelectBaseInfo", "SelectServiceProviders", "SelectAddress", "SelectAnswers", "SelectImages", "SelectCategory", "SelectSubCategory", "SelectSubSubCategory", "SelectService", "SelectStartDate"])
});

type UpdateTaskDraftStateBodySchema = z.infer<typeof updateTaskDraftStateBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdateTaskDraftStateController {
  constructor(
    private updateTaskDraftState: UpdateTaskDraftStateUseCase,
    private validation: ValidationService
  ) { }

  @Post("/:taskId/update-draft-state")
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body() data: UpdateTaskDraftStateBodySchema,
  ) {
    try {
      await this.validation.validateData(updateTaskDraftStateBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateTaskDraftState.execute({
      userId: user.sub,
      state: data.state,
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