import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { QuestionsRepository } from "../../../repositories";
interface UpdateQuestionServiceUseCaseRequest {
  language: "en" | "pt"
  questionId: string,
  serviceId: string
}

type UpdateQuestionServiceUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateQuestionServiceUseCase {
  constructor(
    private questionRepository: QuestionsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    questionId,
    serviceId
  }: UpdateQuestionServiceUseCaseRequest): Promise<UpdateQuestionServiceUseCaseResponse> {
    const existQuestion = await this.questionRepository.findById(questionId);

    if (!existQuestion) {
      return left(new ResourceNotFoundError(this.i18n.t("errors.question.image.not_found", {
        lang: I18nContext.current()?.lang
      })));
    }

    const questionWithTest = await this.questionRepository.findByTitleAndService({
      serviceId,
      title: existQuestion.title
    })
    if (questionWithTest) {
      return left(new InvalidResourceError("Already exist an question with this title"))
    }

    await this.questionRepository.updateService(questionId, serviceId);

    return right({
      message: this.i18n.t("errors.question.image.success_add", {
        lang: I18nContext.current()?.lang
      })
    });
  }
}
