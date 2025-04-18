import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { SubSubCategory } from "../../../../enterprise";

import {
  SubSubCategoriesRepository,
  SubCategoriesRepository
} from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface CreateSubSubCategoryUseCaseRequest {
  language: LanguageSlug
  title: string
  subCategoryId: string
  imageUrl: string | null
}

type CreateSubSubCategoryUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    subCategory: SubSubCategory
  }
>

@Injectable()
export class CreateSubSubCategoryUseCase {
  constructor(
    private subcategoryRepository: SubCategoriesRepository,
    private subSubCategoriesRepository: SubSubCategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    title,
    subCategoryId,
    imageUrl,
    language
  }: CreateSubSubCategoryUseCaseRequest): Promise<CreateSubSubCategoryUseCaseResponse> {
    const subCategory = await this.subcategoryRepository.findById({
      id: subCategoryId,
      language
    });

    if (!subCategory) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.sub_categories.not_found")
        ));
    }

    const existTitle = await this.subSubCategoriesRepository.findByTitle(title)

    if (existTitle) {
      return left(new ResourceNotFoundError("Already exist subsubcategory with this title"));
    }

    const subSubCategory = SubSubCategory.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      url: imageUrl ?? "",
      subCategoryId: new UniqueEntityID(subCategoryId),
    });

    const result = await this.subSubCategoriesRepository.create(subSubCategory);

    return right({
      subCategory: result,
    });
  }
}
