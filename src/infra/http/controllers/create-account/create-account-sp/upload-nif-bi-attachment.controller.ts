import {
  BadRequestException,
  Controller,
  NotFoundException,
  Param,
  Post,
  UnsupportedMediaTypeException,
  UploadedFiles,
  UseInterceptors,
  PayloadTooLargeException,
  Headers
} from "@nestjs/common";

import { Public } from "@/infra/auth/public";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UploadDocumentUseCase } from "@/domain/users/application/use-cases/service-provider/register/upload-documents-attachment";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { ResourceNotFoundError } from "@/core/errors";
import multerConfig from "@/infra/storage/multer";
import path from "path";
import { ServiceProviderPresenter } from "@/infra/http/presenters/service-provider-presenter";
import { EnvService } from "@/infra/environment/env.service";

@ApiTags("Service Providers")
@Controller("/service-providers")
@Public()
export class UploadNifBIController {
  constructor(
    private env: EnvService,
    private uploadDocument: UploadDocumentUseCase
  ) { }

  @Post(":serviceProviderId/nif-bi")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "nif", maxCount: 1, },
    { name: "bi_front", maxCount: 1 },
    { name: "bi_back", maxCount: 1, },
  ], {
    limits: {
      fieldSize: 1024 * 1024 * 6
    },
    fileFilter: (req, file, callback) => {
      const fileSize = parseInt(req.headers["content-length"]);
      const acceptableExtensions = [".jpeg", ".jpg", ".png", ".heic", ".heif", ".pdf"];
      if (!(acceptableExtensions.includes(path.extname(file.originalname)))) {
        return callback(
          new UnsupportedMediaTypeException("Only excel files are allowed"),
          false);
      }
      if (fileSize > 1024 * 1024 * 6) {
        return callback(new PayloadTooLargeException("Document should have less than 6MB"), false);
      }

      callback(null, true);
    },
    ...multerConfig,
  }))
  @ApiConsumes("multipart/form-data")
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("serviceProviderId") serviceProviderId: string,
    @UploadedFiles() files: {
      nif: Express.MulterS3.File[],
      bi_front: Express.MulterS3.File[],
      bi_back: Express.MulterS3.File[],
    }) {
    const result = await this.uploadDocument.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      serviceProviderId,
      listDocuments: {
        nif: files.nif[0].key,
        bi_front: files.bi_front[0].key,
        bi_back: files.bi_back[0].key
      }
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === InvalidAttachmentType)
        throw new UnsupportedMediaTypeException(error.message);
      else if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException(`Service provider: ${serviceProviderId} not found`);
      throw new BadRequestException(error.message);
    }

    return {
      message: result.value.message,
      next_step: result.value.nextStep,
      service_provider: ServiceProviderPresenter.toHTTP(result.value.serviceProvider, this.env.get("STORAGE_URL"))
    };
  }

}