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
import { UpdateSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-category/update-subcategory";

import { z } from "zod";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { SubCategoryPresenter } from "../../../../presenters/sub-category-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const subCategoriesBodySchema = z.object({
  title: z.string({
    invalid_type_error: "sub_categories.title.invalid_type_error",
    required_error: "sub_categories.title.invalid_type_error"
  }),
});

type SubCategoriesBodySchema = z.infer<typeof subCategoriesBodySchema>

@ApiTags("Categories")
@Controller("/subcategories")
@Public()
export class UpdateSubCategoryController {
  constructor(
    private env: EnvService,
    private updateCategory: UpdateSubCategoryUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put(":subcategoryId")
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: SubCategoriesBodySchema,
    @Param("subcategoryId") subCategoryId: string
  ) {
    try {
      await this.validation.validateData(subCategoriesBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateCategory.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      subCategoryId
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

    const { subCategory } = result.value;

    return {
      sub_category: SubCategoryPresenter.toHTTP(subCategory, this.env.get("STORAGE_URL"))
    };
  }
}