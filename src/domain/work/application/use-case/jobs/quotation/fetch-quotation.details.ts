import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";

import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Quotation } from "@/domain/work/enterprise";
import { QuotationsRepository } from "../../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchQuotationDetailsUseCaseRequest {
  quotationId: string
}

type FetchQuotationDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    quotation: Quotation
  }
>

@Injectable()
export class FetchQuotationDetailsUseCase {
  constructor(
    private quotationsRepository: QuotationsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    quotationId
  }: FetchQuotationDetailsUseCaseRequest): Promise<FetchQuotationDetailsUseCaseResponse> {
    const quotation = await this.quotationsRepository.findById(quotationId);

    if (!quotation) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")));
    }

    return right({
      quotation
    });
  }
}
