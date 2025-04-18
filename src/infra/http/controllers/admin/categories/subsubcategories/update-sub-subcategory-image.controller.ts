import {
  BadRequestException,
  ConflictException,
  Controller,
  Headers,
  Param,
  PayloadTooLargeException,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import multerConfig from "@/infra/storage/multer";

import { Public } from "@/infra/auth/public";
import { ApiTags } from "@nestjs/swagger";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { UpdateSubSubCategoryImageUseCase } from "@/domain/work/application/use-case/categories/sub-sub-category/update-sub-subcategory-image";
import { I18nContext, I18nService } from "nestjs-i18n";
import { FileInterceptor } from "@nestjs/platform-express";
import path from "path";

@ApiTags("Categories")
@Controller("/sub-subcategories")
@Public()
export class UpdateSubSubCategoryImageController {
  constructor(
    private updateSubSubCategoryImage: UpdateSubSubCategoryImageUseCase,
    private readonly i18n: I18nService
  ) { }

  @Post(":subSubCategoryId/update-image")
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
  async handle(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.MulterS3.File,
    @Param("subSubCategoryId") subSubCategoryId: string
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

    const result = await this.updateSubSubCategoryImage.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      subSubCategoryId,
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

    const { message } = result.value;

    return {
      message
    };
  }
}