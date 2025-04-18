import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchJobDetailsJobsUseCase } from "@/domain/work/application/use-case/jobs/fetch-jobs-details";
import { JobPresenter } from "@/infra/http/presenters/job-presenter";
import { EnvService } from "@/infra/environment/env.service";

@ApiTags("Jobs")
@Controller("/jobs")
export class FetchJobDetailsController {
  constructor(
    private env: EnvService,
    private fetchJobDetails: FetchJobDetailsJobsUseCase
  ) { }

  @Get(":jobId")
  @UseGuards(JwtAuthGuard)
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string
  ) {
    const result = await this.fetchJobDetails.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      jobId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      test: 12,
      job: JobPresenter.toHTTP(result.value?.job, this.env.get("STORAGE_URL")),
    };
  }

}