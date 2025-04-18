import {
  BadRequestException,
  ConflictException,
  Controller,
  Headers,
  NotFoundException,
  PayloadTooLargeException,
  Put,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { ApiConsumes, ApiTags } from "@nestjs/swagger";

import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ResourceNotFoundError } from "@/core/errors";
import { FileInterceptor } from "@nestjs/platform-express";
import { I18nContext, I18nService } from "nestjs-i18n";
import multerConfig from "@/infra/storage/multer";
import path from "path";
import { EnvService } from "@/infra/environment/env.service";
import { UpdateUserProfileImageCase } from "@/domain/users/application/use-cases/user/update-user-profile-image";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdateUserProfileImageController {
  constructor(
    private env: EnvService,
    private updateUserProfileImage: UpdateUserProfileImageCase,
    private readonly i18n: I18nService
  ) { }

  @Put("profile-image")
  @UseInterceptors(FileInterceptor("profile", {
    ...multerConfig,
    limits: {
      fieldSize: 1024 * 1024 * 6
    },
    fileFilter: (req, file, callback) => {
      const fileSize = parseInt(req.headers["content-length"]);
      const acceptableExtensions = [".png", ".jpeg", ".jpg"];
      if (!(acceptableExtensions.includes(path.extname(file.originalname.toLowerCase())))) {
        return callback(
          new UnsupportedMediaTypeException("Only png, jpeg and jpg files are allowed"),
          false);
      }
      if (fileSize > 1024 * 1024 * 6) {
        return callback(new PayloadTooLargeException("File to large. it should have less than 6MB"), false);
      }
      console.log("dados da image: ", file);
      callback(null, true);
    }
  }))
  @ApiConsumes("multipart/form-data")
  async handle(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.MulterS3.File,
    @AuthenticatedUser() user: AuthPayload,
  ) {
    console.log("valor do file: ", file)
    if (!file) {
      throw new NotFoundException("Não foi possivel atualizar a tua de perfil. Tente novamente");
      return;
    }

    const result = await this.updateUserProfileImage.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      profileUrl: file && file.key ? file.key : null
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
      else if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }

    const { message } = result.value;
    console.log("result: ", result);
    return {
      message,
      profile_url: file && file.key ? `${this.env.get("STORAGE_URL")}${file.key}` : null
    };
  }
}