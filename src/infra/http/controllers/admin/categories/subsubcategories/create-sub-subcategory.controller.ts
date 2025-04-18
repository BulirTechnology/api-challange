import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Headers,
  PayloadTooLargeException,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";

import { z } from "zod";
import { CreateSubSubCategoryUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/create-sub-subcategory";
import { FileInterceptor } from "@nestjs/platform-express";
import multerConfig from "@/infra/storage/multer";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { SubSubCategoryPresenter } from "../../../../presenters/sub-sub-category-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { I18nContext, I18nService } from "nestjs-i18n";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import path from "path";

const subSubCategoriesBodySchema = z.object({
  title: z.string({
    invalid_type_error: "sub_sub_categories.title.invalid_type_error",
    required_error: "sub_sub_categories.title.invalid_type_error"
  }),
  sub_category_id: z.string({
    invalid_type_error: "sub_sub_categories.sub_category_id.invalid_type_error",
    required_error: "sub_sub_categories.sub_category_id.invalid_type_error"
  })
});

type SubSubCategoriesBodySchema = z.infer<typeof subSubCategoriesBodySchema>

@ApiTags("Categories")
@Controller("/sub-subcategories")
@Public()
export class CreateSubSubCategoryController {
  constructor(
    private env: EnvService,
    private createSubSubCategory: CreateSubSubCategoryUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor("image", {
    ...multerConfig,
    limits: {
      fieldSize: 1024 * 1024 * 6
    },
    fileFilter: (req, file, callback) => {
      const fileSize = parseInt(req.headers["content-length"]);
      const acceptableExtensions = [".jpeg", ".jpg", ".png", ".heic", ".heif", ".svg"];
      if (!(acceptableExtensions.includes(path.extname(file.originalname.toLowerCase())))) {
        return callback(
          new UnsupportedMediaTypeException("Only png, jpeg and jpg files are allowed"),
          false);
      }
      if (fileSize > 1024 * 1024 * 6) {
        return callback(new PayloadTooLargeException("File to large. it should have less than 6MB"), false);
      }

      callback(null, true);
    }
  }))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        sub_category_id: {
          type: "string",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successful response. Sub-subCategory created with success",
    schema: {
      properties: {
        category: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            title: {
              type: "string"
            },
            url: {
              type: "string"
            },
            created_at: {
              type: "Date"
            },
            updated_at: {
              type: "Date"
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 413,
    description: "Error response. Content to large - the request entity is larger than limits defined by server",
    schema: {
      properties: {
        message: {
          type: "string",
          description: "The main message error"
        },
        statusCode: {
          type: "number",
        },
        errors: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  @ApiResponse({
    status: 415,
    description: "Error response. Unsupported Media Type sended",
    schema: {
      properties: {
        message: {
          type: "string",
          description: "The main message error"
        },
        statusCode: {
          type: "number",
        },
        errors: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: "Error response. There is an error in the body property",
    schema: {
      properties: {
        message: {
          type: "string",
          description: "The main message error"
        },
        statusCode: {
          type: "number",
        },
        error: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: SubSubCategoriesBodySchema,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    try {
      await this.validation.validateData(subSubCategoriesBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }
    const result = await this.createSubSubCategory.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      title: data.title,
      subCategoryId: data.sub_category_id,
      imageUrl: file && file.key ? file.key : null
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
      sub_category: SubSubCategoryPresenter.toHTTP(subCategory, this.env.get("STORAGE_URL"))
    };
  }
}