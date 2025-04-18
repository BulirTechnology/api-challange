import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { Category } from "../../../../enterprise";
import { CategoriesRepository } from "../../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateCategoryUseCaseRequest {
  language: "en" | "pt"
  title: string
  categoryId: string
}

type UpdateCategoryUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    category: Category
  }
>

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    title,
    categoryId,
    language
  }: UpdateCategoryUseCaseRequest): Promise<UpdateCategoryUseCaseResponse> {
    const category = await this.categoriesRepository.findById({
      id: categoryId,
      language
    });

    if (!category) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.categories.not_found"))
      );
    }

    const categoryWithSameName = await this.categoriesRepository.findByTitle(title)
    if (categoryWithSameName && categoryWithSameName.id.toString() !== categoryId) {
      return left(new InvalidResourceError("Already exist an category with this name"))
    }

    const categoryToUpdate = Category.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      url: category?.url,
      priority: category?.priority
    }, category.id);

    const categoryUpdated = await this.categoriesRepository.update(categoryToUpdate, language);

    return right({
      category: categoryUpdated
    });
  }
}
