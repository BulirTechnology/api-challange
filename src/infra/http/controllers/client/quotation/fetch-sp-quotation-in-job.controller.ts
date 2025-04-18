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
import { EnvService } from "@/infra/environment/env.service";
import { QuotationPresenter } from "@/infra/http/presenters/quotation-presenter";
import { FetchSpQuotationInJobUseCase } from "@/domain/work/application/use-case/jobs/quotation/fetch-sp-quotation-in-job";

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class FetchSpQuotationsInJobController {
  constructor(
    private env: EnvService,
    private fetchSpQuotationInJob: FetchSpQuotationInJobUseCase
  ) { }

  @Get(":jobId/quotations/:serviceProviderId/list")
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string,
    @Param("serviceProviderId") serviceProviderId: string
  ) {
    const result = await this.fetchSpQuotationInJob.execute({
      userId: user.sub,
      jobId,
      serviceProviderId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      quotations: result.value?.quotations.map(item => QuotationPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
    };
  }
}