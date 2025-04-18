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
import { UserDeleteJobUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/user-delete-job";

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class UserDeleteJobController {
  constructor(
    private userDeleteJob: UserDeleteJobUseCase
  ) { }

  @Delete(":jobId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string
  ) {
    const response = await this.userDeleteJob.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      jobId
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