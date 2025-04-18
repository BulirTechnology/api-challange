import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { SubCategory } from "../../../../enterprise";
import {
  SubCategoriesRepository,
  CategoriesRepository
} from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface CreateSubCategoryUseCaseRequest {
  language: LanguageSlug
  title: string
  categoryId: string
  imageUrl: string | null
}

type CreateSubCategoryUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    subCategory: SubCategory
  }
>

@Injectable()
export class CreateSubCategoryUseCase {
  constructor(
    private categoryRepository: CategoriesRepository,
    private subCategoriesRepository: SubCategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    title,
    categoryId,
    imageUrl,
    language
  }: CreateSubCategoryUseCaseRequest): Promise<CreateSubCategoryUseCaseResponse> {
    const category = await this.categoryRepository.findById({ id: categoryId, language });

    if (!category) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.categories.not_found")
        ));
    }

    const subcategoryWithSameName = await this.subCategoriesRepository.findByTitle(title)

    if (subcategoryWithSameName) {
      return left(new InvalidResourceError("Already exist an category with this name"))
    }

    const subCategory = SubCategory.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      url: imageUrl ?? "",
      categoryId: new UniqueEntityID(categoryId),
      hasSubSubCategory: false
    });

    const subCategoryCreated = await this.subCategoriesRepository.create(subCategory);

    return right({
      subCategory: subCategoryCreated,
    });
  }
}
