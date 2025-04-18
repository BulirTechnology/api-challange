import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { QuotationPresenter } from "@/infra/http/presenters/quotation-presenter";

import { FetchQuotationDetailsUseCase } from "@/domain/work/application/use-case/jobs/quotation/fetch-quotation.details";
import { EnvService } from "@/infra/environment/env.service";

@ApiTags("Quotation")
@Controller("/quotations")
export class FetchQuotationDetailsController {
  constructor(
    private env: EnvService,
    private fetchQuotationDetailsUseCase: FetchQuotationDetailsUseCase
  ) { }

  @Get(":quotationId/details")
  @UseGuards(JwtAuthGuard)
  async handle(
    @Param("quotationId") quotationId: string,
  ) {
    const result = await this.fetchQuotationDetailsUseCase.execute({
      quotationId
    });

    if (result.isLeft()) {
      throw new BadRequestException("Quotation not found");
    }

    return {
      quotation: QuotationPresenter.toHTTP(result.value.quotation, this.env.get("STORAGE_URL"))
    };
  }

}