import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";
import { } from "@/core/errors/invalid-attachment-type";
import { Uploader } from "@/core/storage/uploader";

import { CategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateCategoryImageUseCaseRequest {
  language: LanguageSlug
  categoryId: string,
  imageUrl: string
}

type UpdateCategoryImageUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateCategoryImageUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private uploader: Uploader,
    private readonly i18n: I18nService
  ) { }

  async execute({
    categoryId,
    imageUrl,
    language
  }: UpdateCategoryImageUseCaseRequest): Promise<UpdateCategoryImageUseCaseResponse> {
    const existCategory = await this.categoriesRepository.findById({
      id: categoryId,
      language
    });

    if (!existCategory) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.categories.not_found"))
      );
    }

    await this.categoriesRepository.updateImage(categoryId, imageUrl);

    return right({
      message: processI18nMessage(this.i18n, "errors.categories.image_updated")
    });
  }
}
