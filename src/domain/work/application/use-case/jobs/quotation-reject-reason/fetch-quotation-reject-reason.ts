import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { QuotationRejectReason } from "../../../../enterprise";
import { QuotationRejectReasonRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchQuotationRejectReasonUseCaseRequest {
  language: LanguageSlug
  page: number,
  perPage?: number
}

type FetchQuotationRejectReasonUseCaseResponse = Either<
  null,
  {
    data: QuotationRejectReason[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchQuotationRejectReasonUseCase {
  constructor(private quotationsRepository: QuotationRejectReasonRepository) { }

  async execute({
    page,
    perPage
  }: FetchQuotationRejectReasonUseCaseRequest): Promise<FetchQuotationRejectReasonUseCaseResponse> {
    const data = await this.quotationsRepository.findMany({ page, perPage });

    return right({
      data: data.data,
      meta: data.meta
    });
  }
}
