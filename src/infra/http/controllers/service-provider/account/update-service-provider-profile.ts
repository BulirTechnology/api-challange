import {
  Body,
  Controller,
  BadRequestException,
  Put,
  UseGuards,
  UseInterceptors,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
  Headers,
  UploadedFile
} from "@nestjs/common";

import { z } from "zod";
import multerConfig from "@/infra/storage/multer";

import {
  ApiTags,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateServiceProviderProfileUseCase } from "@/domain/users/application/use-cases/service-provider/details/update-service-provider-profile";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import path from "path";

const updateServiceProviderProfileBodySchema = z.object({
  description: z.string({
    invalid_type_error: "user.description.invalid_type_error",
    required_error: "user.description.invalid_type_error"
  }),
  skills: z.array(z.string(), {
    invalid_type_error: "user.skills.invalid_type_error",
    required_error: "user.skills.invalid_type_error"
  }),
  education: z.enum([
    "PrimaryEducation",
    "SecondaryEducation",
    "HigherEducation",
    "GraduateEducation",
    "ProfessionalDegrees"
  ]),
  address: z.object({
    id: z.string({
      invalid_type_error: "address.id.invalid_type_error",
      required_error: "address.id.invalid_type_error"
    }),
    name: z.string({
      invalid_type_error: "address.name.invalid_type_error",
      required_error: "address.name.invalid_type_error"
    }),
    line1: z.string({
      invalid_type_error: "address.line1.invalid_type_error",
      required_error: "address.line1.invalid_type_error"
    }),
    line2: z.string({
      invalid_type_error: "address.line2.invalid_type_error",
      required_error: "address.line2.invalid_type_error"
    }),
    latitude: z.number({
      invalid_type_error: "address.latitude.invalid_type_error",
      required_error: "address.latitude.invalid_type_error"
    }),
    longitude: z.number({
      invalid_type_error: "address.longitude.invalid_type_error",
      required_error: "address.longitude.invalid_type_error"
    })
  }, {
    invalid_type_error: "user.address.invalid_type_error",
    required_error: "user.address.invalid_type_error"
  }).nullish(),
});

type UpdateServiceProviderProfileBodySchema = z.infer<typeof updateServiceProviderProfileBodySchema>

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class UpdateServiceProviderProfileController {
  constructor(
    private updateServiceProviderProfile: UpdateServiceProviderProfileUseCase,
    private validation: ValidationService
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
        description: {
          type: "string",
        },
        skills: {
          type: "Array of string",
        },
        address: {
          type: "object",
        },
        education: {
          type: "ENUM => PrimaryEducation | SecondaryEducation | HigherEducation | GraduateEducation | ProfessionalDegrees",
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
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: UpdateServiceProviderProfileBodySchema,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    try {
      await this.validation.validateData(updateServiceProviderProfileBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.updateServiceProviderProfile.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      data: {
        description: data.description,
        education: data.education,
        skills: data.skills,
        address: data.address ? {
          id: data.address.id,
          latitude: data.address.latitude,
          line1: data.address.line1,
          line2: data.address.line2,
          longitude: data.address.longitude,
          name: data.address.name
        } : null,
        profileUrl: file && file.key ? file.key : null
      }
    });

    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }

    return {
      message: "Portfolio updated",
      next_step: response.value.nextStep ?? undefined
    };
  }
}