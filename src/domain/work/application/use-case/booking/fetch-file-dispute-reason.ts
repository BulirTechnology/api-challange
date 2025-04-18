import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { FileDisputeReason } from "../../../enterprise";
import { FileDisputeReasonRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchFileDisputeReasonUseCaseRequest {
  language: LanguageSlug
  page: number,
  perPage?: number
}

type FetchFileDisputeReasonUseCaseResponse = Either<
  null,
  {
    data: FileDisputeReason[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchFileDisputeReasonUseCase {
  constructor(private jobsRepository: FileDisputeReasonRepository) { }

  async execute({
    page,
    language,
    perPage
  }: FetchFileDisputeReasonUseCaseRequest): Promise<FetchFileDisputeReasonUseCaseResponse> {
    const data = await this.jobsRepository.findMany({
      language,
      page,
      perPage
    });

    return right({
      data: data.data,
      meta: data.meta
    });
  }
}
