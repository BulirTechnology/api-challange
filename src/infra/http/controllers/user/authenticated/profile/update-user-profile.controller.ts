import {
  BadRequestException,
  Body,
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

import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateUserProfileCase } from "@/domain/users/application/use-cases/user/update-user-profile";

import { z } from "zod";
import { InvalidAttachmentType } from "@/core/errors/invalid-attachment-type";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ResourceNotFoundError } from "@/core/errors";
import { FileInterceptor } from "@nestjs/platform-express";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";
import multerConfig from "@/infra/storage/multer";
import path from "path";
import { EnvService } from "@/infra/environment/env.service";

const profileBodySchema = z.object({
  first_name: z.string({
    invalid_type_error: "user.first_name.invalid_type_error",
    required_error: "user.first_name.invalid_type_error"
  }),
  last_name: z.string({
    invalid_type_error: "user.last_name.invalid_type_error",
    required_error: "user.last_name.invalid_type_error"
  }),
  about_me: z.string({
    invalid_type_error: "user.first_name.invalid_type_error",
    required_error: "user.first_name.invalid_type_error"
  }).optional().default(""),
  born_at: z.string({
    invalid_type_error: "user.born_at.invalid_type_error",
    required_error: "user.born_at.invalid_type_error"
  }).pipe(z.coerce.date()),
  gender: z.enum(["Male", "Female", "NotTell"], {
    invalid_type_error: "user.gender.invalid_type_error",
    required_error: "user.gender.invalid_type_error"
  }),
});

type ProfileBodySchema = z.infer<typeof profileBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdateUserProfileController {
  constructor(
    private env: EnvService,
    private updateUserProfile: UpdateUserProfileCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put("profile")
  @UseInterceptors(FileInterceptor("profile", {
    ...multerConfig,
    limits: {
      fieldSize: 1024 * 1024 * 6
    },
    fileFilter: (req, file, callback) => {
      const fileSize = parseInt(req.headers["content-length"]);
      const acceptableExtensions = [".jpeg", ".jpg", ".png", ".heic", ".heif"];
      console.log("file.originalname: ", file.originalname)
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
        first_name: {
          type: "string",
        },
        last_name: {
          type: "string",
        },
        born_at: {
          type: "Date",
        },
        gender: {
          type: "ENUM => Male | Female",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successful response. Profile updated",
    schema: {
      properties: {
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
        errors: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: "Error response. There is missing property in the body request",
    schema: {
      properties: {
        message: {
          type: "string",
          description: "The main message error"
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
        errors: {
          type: "array",
          description: "The list of errors made in the body request"
        }
      }
    }
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.MulterS3.File,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: ProfileBodySchema,
  ) {
    try {
      await this.validation.validateData(profileBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateUserProfile.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      bornAt: data.born_at,
      firstName: data.first_name,
      gender: data.gender,
      lastName: data.last_name,
      aboutMe: data.about_me,
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

    return {
      message,
      profile_url: file && file.key ? `${this.env.get("STORAGE_URL")}${file.key}` : null
    };
  }
}