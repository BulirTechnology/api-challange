import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";

import { SubSubCategory } from "../../../../enterprise";

import { SubSubCategoriesRepository } from "../../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
interface UpdateSubSubCategoryUseCaseRequest {
  language: "en" | "pt"
  title: string
  subSubCategoryId: string
}

type UpdateSubSubCategoryUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    subSubCategory: SubSubCategory
  }
>

@Injectable()
export class UpdateSubSubCategoryUseCase {
  constructor(
    private subSubCategoriesRepository: SubSubCategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    title,
    subSubCategoryId,
    language
  }: UpdateSubSubCategoryUseCaseRequest): Promise<UpdateSubSubCategoryUseCaseResponse> {
    const subSubCategory = await this.subSubCategoriesRepository.findById({
      id: subSubCategoryId,
      language
    });

    if (!subSubCategory) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.sub_categories.not_found")
        ));
    }

    const subSubCategoryUpdate = SubSubCategory.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      url: subSubCategory.url,
      subCategoryId: subSubCategory.subCategoryId
    });

    const result = await this.subSubCategoriesRepository.update(subSubCategoryUpdate, language);

    return right({
      subSubCategory: result,
    });
  }
}
