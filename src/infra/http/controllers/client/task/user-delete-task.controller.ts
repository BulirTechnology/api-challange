import {
  Controller,
  BadRequestException,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
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
import { UserDeleteTaskUseCase } from "@/domain/work/application/use-case/tasks/user-delete-task";

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UserDeleteTaskController {
  constructor(
    private userDeleteTask: UserDeleteTaskUseCase
  ) { }

  @Delete(":taskId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string
  ) {
    const response = await this.userDeleteTask.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      taskId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException();
      else
        throw new BadRequestException(error.message);
    }
  }
}