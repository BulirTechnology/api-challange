import {
  BadRequestException,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { PublishTaskUseCase } from "@/domain/work/application/use-case/tasks/publish-task";

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class PublishTaskController {
  constructor(
    private publishTask: PublishTaskUseCase
  ) { }

  @Post("/:taskId/publish")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
  ) {
    const result = await this.publishTask.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
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