import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Headers,
  Param,
  Put,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import { ApiTags } from "@nestjs/swagger";
import { UpdateCategoryUseCase } from "@/domain/work/application/use-case/categories/category/update-category";

import { z } from "zod";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { CategoryPresenter } from "../../../../presenters/category-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const categoriesBodySchema = z.object({
  title: z.string({
    invalid_type_error: "categories.title.invalid_type_error",
    required_error: "categories.title.required_error"
  }),
});

type CategoriesBodySchema = z.infer<typeof categoriesBodySchema>

@ApiTags("Categories")
@Controller("/categories")
@Public()
export class UpdateCategoryController {
  constructor(
    private env: EnvService,
    private updateCategory: UpdateCategoryUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put(":categoryId")
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: CategoriesBodySchema,
    @Param("categoryId") categoryId: string
  ) {
    try {
      await this.validation.validateData(categoriesBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateCategory.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      categoryId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === InvalidAttachmentType)
        throw new ConflictException({
          errors: {
            image: this.i18n.t("errors.categories.image.invalid_file_type", {
              lang: I18nContext.current()?.lang
            })
          }
        });

      throw new BadRequestException(error.message);
    }

    const { category } = result.value;

    return {
      category: CategoryPresenter.toHTTP(category, this.env.get("STORAGE_URL"))
    };
  }
}