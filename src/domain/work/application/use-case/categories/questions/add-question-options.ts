import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { randomUUID } from "node:crypto";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { QuestionsRepository } from "../../../repositories/question-repository";

interface AddQuestionOptionsUseCaseRequest {
  language: "en" | "pt"
  questionId: string,
  options: string[]
}

type AddQuestionOptionsUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class AddQuestionOptionsUseCase {
  constructor(
    private questionRepository: QuestionsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    questionId,
    options
  }: AddQuestionOptionsUseCaseRequest): Promise<AddQuestionOptionsUseCaseResponse> {
    const existQuestion = await this.questionRepository.findById(questionId);

    if (!existQuestion) {
      return left(new ResourceNotFoundError(
        this.i18n.t("errors.question.not_found",
          { lang: I18nContext.current()?.lang })
      ));
    }

    if (existQuestion.type === "SIMPLE") {
      return left(new InvalidResourceError("Simple question does not have options"))
    }

    await this.questionRepository.addOption({
      options: options?.map(option => ({
        id: new UniqueEntityID(randomUUID()),
        value: option
      })),
      questionId
    });

    return right({
      message: this.i18n.t("errors.question.option.success_add",
        { lang: I18nContext.current()?.lang })
    });
  }
}
