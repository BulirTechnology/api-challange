import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { SubCategory } from "../../../../enterprise";
import { SubCategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateSubCategoryUseCaseRequest {
  language: LanguageSlug
  title: string
  subCategoryId: string
}

type UpdateSubCategoryUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    subCategory: SubCategory
  }
>

@Injectable()
export class UpdateSubCategoryUseCase {
  constructor(
    private subCategoriesRepository: SubCategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    title,
    subCategoryId,
    language
  }: UpdateSubCategoryUseCaseRequest): Promise<UpdateSubCategoryUseCaseResponse> {
    const subCategory = await this.subCategoriesRepository.findById({ id: subCategoryId, language });

    if (!subCategory) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.categories.not_found")
        ));
    }

    const subCategoryToUpdate = SubCategory.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      url: subCategory.url,
      categoryId: subCategory.categoryId,
      hasSubSubCategory: subCategory.hasSubSubCategory
    }, subCategory.id);

    const valueUpdated = await this.subCategoriesRepository.update(subCategoryToUpdate, language);

    if (!valueUpdated) {
      return left(new ResourceNotFoundError("Error while trying to update subcategory"));
    }

    return right({
      subCategory: valueUpdated,
    });
  }
}
