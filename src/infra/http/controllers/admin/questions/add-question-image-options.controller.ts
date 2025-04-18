import {
  Controller,
  Param,
  Patch,
  NotFoundException,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  Headers,
  UnsupportedMediaTypeException,
  PayloadTooLargeException
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
  ApiConsumes,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { AddQuestionImageOptionsUseCase } from "@/domain/work/application/use-case/categories/questions/add-question-image-options";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { InvalidQuestionOptionError } from "@/domain/work/application/use-case/errors/invalid-question-options";
import { I18nContext, I18nService } from "nestjs-i18n";

@ApiTags("Users")
@Controller("/questions")
export class AddQuestionImageOptionsController {
  constructor(
    private addQuestionOptions: AddQuestionImageOptionsUseCase,
    private readonly i18n: I18nService
  ) { }

  @Patch(":id/image-options")
  @Public()
  @UseInterceptors(FileFieldsInterceptor([
    { name: "images", maxCount: 4, },
  ]))
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("id") questionId: string,
    @UploadedFiles() files: { images: Express.Multer.File[] },
  ) {
    for (const element of files.images) {
      const file = element;

      if (!/^image\/(jpeg|png|jpg|svg\+xml)$/.test(file.mimetype)) {
        throw new UnsupportedMediaTypeException({
          errors: {
            image: this.i18n.t("errors.question.image.file_type", {
              lang: I18nContext.current()?.lang
            })
          }
        });
      }

      if (file.size > 1024 * 1024 * 6) {
        throw new PayloadTooLargeException({
          errors: {
            image: this.i18n.t("errors.question.image.file_max_size", {
              lang: I18nContext.current()?.lang
            })
          }
        });
      }
    }

    const result = await this.addQuestionOptions.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      questionId,
      files: files.images.map(file => ({
        body: file.buffer,
        fileName: file.originalname,
        fileType: file.mimetype
      })),
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException({
          errors: {
            image: this.i18n.t("errors.question.image.not_found", {
              lang: I18nContext.current()?.lang
            })
          }
        });
      else if (error.constructor === InvalidQuestionOptionError)
        throw new BadRequestException({
          errors: {
            image: this.i18n.t("errors.question.image.invalid_file_type", {
              lang: I18nContext.current()?.lang
            })
          }
        });

      throw new BadRequestException(error.message);
    }
  }
}