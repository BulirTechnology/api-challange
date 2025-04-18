import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";

import { SubCategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateSubCategoryImageUseCaseRequest {
  language: LanguageSlug
  subCategoryId: string,
  imageUrl: string
}

type UpdateSubCategoryImageUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateSubCategoryImageUseCase {
  constructor(
    private subCategoriesRepository: SubCategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    subCategoryId,
    imageUrl,
    language
  }: UpdateSubCategoryImageUseCaseRequest): Promise<UpdateSubCategoryImageUseCaseResponse> {
    const existSubCategory = await this.subCategoriesRepository.findById({
      id: subCategoryId,
      language
    });

    if (!existSubCategory) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.sub_categories.not_found")
        ));
    }

    await this.subCategoriesRepository.updateImage(subCategoryId, imageUrl);

    return right({
      message: processI18nMessage(this.i18n, "errors.sub_categories.image_updated")
    });
  }
}
