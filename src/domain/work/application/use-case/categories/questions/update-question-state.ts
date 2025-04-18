import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";

import { QuestionState } from "../../../../enterprise";
import { QuestionsRepository } from "../../../repositories";

interface UpdateQuestionStateUseCaseRequest {
  language: "en" | "pt"
  questionId: string,
  state: QuestionState
}

type UpdateQuestionStateUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateQuestionStateUseCase {
  constructor(
    private questionRepository: QuestionsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    questionId,
    state
  }: UpdateQuestionStateUseCaseRequest): Promise<UpdateQuestionStateUseCaseResponse> {
    const existQuestion = await this.questionRepository.findById(questionId);

    if (!existQuestion) {
      return left(new ResourceNotFoundError(this.i18n.t("errors.question.image.not_found", {
        lang: I18nContext.current()?.lang
      })));
    }

    await this.questionRepository.updateState(questionId, state);

    return right({
      message: "Question state updated"
    });
  }
}
