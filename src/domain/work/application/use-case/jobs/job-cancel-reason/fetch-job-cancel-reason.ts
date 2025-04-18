import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { JobCancelReason } from "../../../../enterprise";
import { JobCancelReasonRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchJobCancelReasonUseCaseRequest {
  language: LanguageSlug
  page: number,
  perPage?: number
}

type FetchJobCancelReasonUseCaseResponse = Either<
  null,
  {
    data: JobCancelReason[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchJobCancelReasonUseCase {
  constructor(private jobsRepository: JobCancelReasonRepository) { }

  async execute({
    page,
    language,
    perPage
  }: FetchJobCancelReasonUseCaseRequest): Promise<FetchJobCancelReasonUseCaseResponse> {
    const data = await this.jobsRepository.findMany({
      page,
      language,
      perPage
    });

    return right({
      data: data.data,
      meta: data.meta
    });
  }
}
