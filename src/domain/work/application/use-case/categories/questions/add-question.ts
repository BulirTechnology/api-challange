import { Injectable } from "@nestjs/common";
import {
  I18nContext,
  I18nService
} from "nestjs-i18n";
import { randomUUID } from "node:crypto";
import {
  Either,
  left,
  right
} from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  Question,
  TypeQuestion
} from "../../../../enterprise";
import {
  ServicesRepository,
  QuestionsRepository
} from "../../../repositories";
interface AddQuestionUseCaseRequest {
  language: "en" | "pt"
  serviceId: string
  title: string
  typeQuestion: TypeQuestion
  options?: string[]
}

type AddQuestionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    question: Question
  }
>

@Injectable()
export class AddQuestionUseCase {
  constructor(
    private questionRepository: QuestionsRepository,
    private serviceRepository: ServicesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    serviceId,
    title,
    typeQuestion,
    options,
    language
  }: AddQuestionUseCaseRequest): Promise<AddQuestionUseCaseResponse> {
    const service = await this.serviceRepository.findById({ id: serviceId, language });

    if (!service) {
      return left(new ResourceNotFoundError(this.i18n.t("errors.services.not_found", {
        lang: I18nContext.current()?.lang
      })));
    }

    const existQuestionInService = await this.questionRepository.findByTitleAndService({
      title,
      serviceId
    })

    if (existQuestionInService) {
      return left(new InvalidResourceError("Already exist an question with this title in this service"))
    }

    const question = Question.create({
      title,
      type: typeQuestion,
      state: "DRAFT",
      serviceId: new UniqueEntityID(serviceId),
      options: options?.map(option => ({
        id: new UniqueEntityID(randomUUID()),
        value: option
      }))
    });

    const created = await this.questionRepository.create(question);

    return right({
      question: created,
    });
  }
}
