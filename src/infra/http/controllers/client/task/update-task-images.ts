import {
  BadRequestException,
  Controller,
  NotFoundException,
  Param,
  UnsupportedMediaTypeException,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Put,
  Headers,
  PayloadTooLargeException
} from "@nestjs/common";

import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import multerConfig from "@/infra/storage/multer";

import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UpdateTaskImagesUseCase } from "@/domain/work/application/use-case/tasks/update-task-images";
import path from "path";

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UploadTaskImageController {
  constructor(
    private updateTaskImages: UpdateTaskImagesUseCase
  ) { }

  @Put(":taskId/images")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "images", maxCount: 6 },
  ], {
    limits: {
      fieldSize: 1024 * 1024 * 36
    },
    fileFilter: (req, file, callback) => {
      const fileSize = parseInt(req.headers["content-length"]);
      const acceptableExtensions = [".jpeg", ".jpg", ".png", ".heic", ".heif"];

      if (!(acceptableExtensions.includes(path.extname(file.originalname.toLowerCase())))) {
        return callback(
          new UnsupportedMediaTypeException("Image should be of type .jpg, .jpeg, .png, .heif"),
          false);
      }
      if (fileSize > 1024 * 1024 * 36) {
        return callback(new PayloadTooLargeException("Document should have less than 6MB"), false);
      }

      callback(null, true);
    },
    ...multerConfig,
  }))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        images: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("taskId") taskId: string,
    @UploadedFiles(
    ) files: {
      images: Express.MulterS3.File[],
    }) {
    if (!files || !files.images || files.images.length <= 0) {
      throw new NotFoundException("You should submit the task images");
    }

    const result = await this.updateTaskImages.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      imageUrls: files.images.map(image => ({
        url: image.key
      })),
      taskId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === InvalidAttachmentType)
        throw new UnsupportedMediaTypeException(error.message);
      else if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException("Resource not found");

      throw new BadRequestException(error.message);
    }

    return {
      list: {
        image1: result.value.listImages.image1,
        image2: result.value.listImages.image2,
        image3: result.value.listImages.image3,
        image4: result.value.listImages.image4,
        image5: result.value.listImages.image5,
        image6: result.value.listImages.image6,
      }
    }
  }

}