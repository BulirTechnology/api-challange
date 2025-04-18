import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Question } from "../../../../enterprise/questions";

import { QuestionsRepository } from "../../../repositories";

interface FetchQuestionsUseCaseRequest {
  page: number,
  perPage?: number
  serviceId: string
  language: "en" | "pt"
}

type FetchQuestionsUseCaseResponse = Either<
  null,
  {
    questions: Question[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchQuestionsUseCase {
  constructor(private questionsRepository: QuestionsRepository) { }

  async execute({
    page,
    serviceId,
    perPage
  }: FetchQuestionsUseCaseRequest): Promise<FetchQuestionsUseCaseResponse> {
    const questions = await this.questionsRepository.findMany({ page, serviceId, perPage });

    return right({
      questions: questions.data,
      meta: questions.meta
    });
  }
}
