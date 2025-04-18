import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { QuotationRejectReason } from "../../../../enterprise";
import { QuotationRejectReasonRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface AddQuotationRejectReasonUseCaseRequest {
  language: LanguageSlug
  value: string
}

type AddQuotationRejectReasonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    quotation: QuotationRejectReason
  }
>

@Injectable()
export class AddQuotationRejectReasonUseCase {
  constructor(
    private quotationRejectReasonRepository: QuotationRejectReasonRepository
  ) { }

  async execute({
    value
  }: AddQuotationRejectReasonUseCaseRequest): Promise<AddQuotationRejectReasonUseCaseResponse> {
    const existQuotation = await this.quotationRejectReasonRepository.findByTitle(value)

    if (existQuotation) {
      return left(new InvalidResourceError("Already exist an quotation with this title"))
    }

    const quotation = QuotationRejectReason.create({
      value
    });

    const quotationCreated = await this.quotationRejectReasonRepository.create(quotation);

    return right({
      quotation: quotationCreated
    });
  }
}
