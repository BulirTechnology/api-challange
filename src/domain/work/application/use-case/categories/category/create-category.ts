import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { InvalidResourceError } from "@/core/errors/invalid-resource-error";

import { Category } from "../../../../enterprise";
import { CategoriesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface CreateCategoryUseCaseRequest {
  language: LanguageSlug
  title: string
  priority: number
  imageUrl: string | null
}

type CreateCategoryUseCaseResponse = Either<
  InvalidResourceError,
  {
    category: Category
  }
>

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    title,
    imageUrl,
    priority,
    language
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    const categoryWithSameName = await this.categoriesRepository.findByTitle(title)

    if (categoryWithSameName) {
      return left(new InvalidResourceError("Already exist an category with this name"))
    }

    const category = Category.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      url: imageUrl ?? "",
      priority
    });

    const createdCategory = await this.categoriesRepository.create(category);

    return right({
      category: createdCategory,
    });
  }
}
