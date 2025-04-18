import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { TaskDeleteReason } from "../../../enterprise";
import { TaskDeleteReasonRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchTaskDeleteReasonUseCaseRequest {
  language: LanguageSlug
  page: number,
  perPage?: number
}

type FetchTaskDeleteReasonUseCaseResponse = Either<
  null,
  {
    data: TaskDeleteReason[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchTaskDeleteReasonUseCase {
  constructor(private tasksRepository: TaskDeleteReasonRepository) { }

  async execute({
    page,
    perPage
  }: FetchTaskDeleteReasonUseCaseRequest): Promise<FetchTaskDeleteReasonUseCaseResponse> {
    const data = await this.tasksRepository.findMany({ page, perPage });

    return right({
      data: data.data,
      meta: data.meta
    });
  }
}
