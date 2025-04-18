import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";

import { SubSubCategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateSubSubCategoryImageUseCaseRequest {
  language: LanguageSlug
  subSubCategoryId: string,
  imageUrl: string
}

type UpdateSubSubCategoryImageUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateSubSubCategoryImageUseCase {
  constructor(
    private subSubCategoriesRepository: SubSubCategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    subSubCategoryId,
    imageUrl,
    language
  }: UpdateSubSubCategoryImageUseCaseRequest): Promise<UpdateSubSubCategoryImageUseCaseResponse> {
    const existSubCategory = await this.subSubCategoriesRepository.findById({
      id: subSubCategoryId,
      language
    });

    if (!existSubCategory) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.sub_categories.not_found")
        ));
    }

    await this.subSubCategoriesRepository.updateImage(subSubCategoryId, imageUrl);

    return right({
      message: processI18nMessage(this.i18n, "errors.sub_sub_categories.image_updated")
    });
  }
}
