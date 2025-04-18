import {
  BadRequestException,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { SetQuotationAsReadUseCase } from "@/domain/work/application/use-case/jobs/quotation/set-quotation-as-read";

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class SetQuotationAsReadController {
  constructor(
    private setQuotationAsRead: SetQuotationAsReadUseCase,
  ) { }

  @Put(":jobId/quotations/:quotationId/read")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string,
    @Param("quotationId") quotationId: string,
  ) {
    const result = await this.setQuotationAsRead.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      jobId,
      quotationId,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}