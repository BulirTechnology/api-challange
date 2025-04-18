import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { SetJobAsViewedUseCase } from "@/domain/work/application/use-case/jobs/set-job-as-viewed";

@ApiTags("Jobs")
@Controller("/service-providers")
export class SetJobAsViewedController {
  constructor(
    private fetchServiceProviderJobs: SetJobAsViewedUseCase,
  ) { }

  @Get("jobs/:jobId/viewed")
  @UseGuards(JwtAuthGuard)
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string
  ) {
    

    const result = await this.fetchServiceProviderJobs.execute({
      userId: user.sub,
      jobId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}