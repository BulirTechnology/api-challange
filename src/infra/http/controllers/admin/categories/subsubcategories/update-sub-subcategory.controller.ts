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

import { z } from "zod";
import { UpdateSubSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/update-sub-subcategory";

import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { SubSubCategoryPresenter } from "../../../../presenters/sub-sub-category-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { I18nContext, I18nService } from "nestjs-i18n";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const subSubCategoriesBodySchema = z.object({
  title: z.string({
    invalid_type_error: "sub_sub_categories.title.invalid_type_error",
    required_error: "sub_sub_categories.title.invalid_type_error"
  }),
});

type SubSubCategoriesBodySchema = z.infer<typeof subSubCategoriesBodySchema>

@ApiTags("Categories")
@Controller("/sub-subcategories")
@Public()
export class UpdateSubSubCategoryController {
  constructor(
    private env: EnvService,
    private updateSubSubCategory: UpdateSubSubCategoryUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put(":subSubCategoryId")
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: SubSubCategoriesBodySchema,
    @Param("subSubCategoryId") subSubCategoryId: string
  ) {
    try {
      await this.validation.validateData(subSubCategoriesBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }
    const result = await this.updateSubSubCategory.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      subSubCategoryId
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

    const { subSubCategory } = result.value;

    return {
      sub_category: SubSubCategoryPresenter.toHTTP(subSubCategory, this.env.get("STORAGE_URL"))
    };
  }
}