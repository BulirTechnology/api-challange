import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { randomUUID } from "crypto";
import { ResourceNotFoundError } from "@/core/errors";
import { Either, left, right } from "@/core/either";
import { Uploader } from "@/core/storage/uploader";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";

import { QuestionOptions } from "../../../../enterprise";
import { QuestionsRepository } from "../../../repositories";
import { InvalidQuestionOptionError } from "../../errors/invalid-question-options";
interface AddQuestionImageOptionsUseCaseRequest {
  language: "en" | "pt"
  questionId: string
  files: {
    fileName: string
    fileType: string
    body: Buffer
  }[]
}

type AddQuestionImageOptionsUseCaseResponse = Either<
  InvalidAttachmentType,
  null
>

@Injectable()
export class AddQuestionImageOptionsUseCase {
  constructor(
    private questionRepository: QuestionsRepository,
    private uploader: Uploader,
    private readonly i18n: I18nService
  ) { }

  async execute({
    questionId,
    files
  }: AddQuestionImageOptionsUseCaseRequest): Promise<AddQuestionImageOptionsUseCaseResponse> {
    const question = await this.questionRepository.findById(questionId);

    if (!question) {
      return left(new ResourceNotFoundError(this.i18n.t("errors.question.not_found",
        { lang: I18nContext.current()?.lang })
      ));
    }

    if (question.type !== "SINGLE_SELECT_IMAGE") {
      return left(new InvalidQuestionOptionError());
    }

    for (const file of files) {
      if (file && !/^image\/(jpeg|png|jpg|svg\+xml)$/.test(file.fileType)) {
        return left(new InvalidAttachmentType(file.fileType));
      }
    }

    const options: QuestionOptions[] = [];

    for (const item of files) {
      let urlToSave = "";
      if (item.fileName) {
        const { url } = await this.uploader.upload({
          body: item.body,
          fileName: item.fileName,
          fileType: item.fileType
        });

        urlToSave = url;
      }

      const option: QuestionOptions = {
        id: new UniqueEntityID(randomUUID()),
        value: urlToSave
      };

      options.push(option);
    }

    await this.questionRepository.addOption({
      questionId,
      options
    });

    return right(null);
  }
}
