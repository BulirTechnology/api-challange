import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
  NotFoundException,
  Headers
} from "@nestjs/common";

import { z } from "zod";
import multerConfig from "@/infra/storage/multer";

import { AddServiceProviderPortfolioUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/add-service-provider-portfolio";

import {
  ApiTags,
  ApiResponse,
  ApiConsumes,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { PortfolioPresenter } from "@/infra/http/presenters/portfolio-presenter";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { EnvService } from "@/infra/environment/env.service";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import path from "path";

const addServiceProviderPortfolioBodySchema = z.object({
  title: z.string({
    invalid_type_error: "portfolio.title.invalid_type_error",
    required_error: "portfolio.title.invalid_type_error"
  }),
  description: z.string({
    invalid_type_error: "portfolio.description.invalid_type_error",
    required_error: "portfolio.description.invalid_type_error"
  }),
});

type AddServiceProviderPortfolioBodySchema = z.infer<typeof addServiceProviderPortfolioBodySchema>

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class AddServiceProviderPortfolioController {
  constructor(
    private env: EnvService,
    private addServiceProviderPortfolio: AddServiceProviderPortfolioUseCase,
    private validation: ValidationService
  ) { }

  @Post("portfolio")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "images", maxCount: 6 },
  ], {
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
  @ApiResponse({ status: 201, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AddServiceProviderPortfolioBodySchema,
    @UploadedFiles() files?: { images: Express.MulterS3.File[] },
  ) {
    try {
      await this.validation.validateData(addServiceProviderPortfolioBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    if (!files?.images) {
      throw new NotFoundException("Tens de informar lista das images");
    }

    const response = await this.addServiceProviderPortfolio.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      title: data.title,
      description: data.description,
      imageUrls: files.images.map(file => ({
        url: file.key
      }))
    });

    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }

    return {
      data: PortfolioPresenter.toHTTP(response.value.portfolio, this.env.get("STORAGE_URL")),
      next_step: response.value.nextStep ?? undefined
    };
  }
}