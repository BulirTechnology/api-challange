import {
  BadRequestException,
  ConflictException,
  Controller,
  Headers,
  HttpCode,
  Param,
  Patch,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import multerConfig from "@/infra/storage/multer";
import { ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { UpdateCategoryImageUseCase } from "@/domain/work/application/use-case/categories/category/update-category-image";
import { FileInterceptor } from "@nestjs/platform-express";
import { I18nContext, I18nService } from "nestjs-i18n";
import path from "path";

@ApiTags("Categories")
@Controller("/categories")
@Public()
export class UpdateCategoryImageController {
  constructor(
    private updateCategoryImage: UpdateCategoryImageUseCase,
    private readonly i18n: I18nService
  ) { }

  @ApiResponse({
    status: 200,
    description: "Successful response. Category image updated",
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
  @Patch(":categoryId/image")
  @ApiConsumes("multipart/form-data")
  @HttpCode(200)
  async handle(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.MulterS3.File,
    @Param("categoryId") categoryId: string
  ) {
    if (!file || !file.key) {
      throw new BadRequestException({
        errors: {
          image: this.i18n.t("errors.categories.image.required_error", {
            lang: I18nContext.current()?.lang
          })
        }
      });
    }

    const result = await this.updateCategoryImage.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      categoryId,
      imageUrl: file.key
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
  }
}