import {
  Body,
  Controller,
  BadRequestException,
  Param,
  Put,
  UseGuards,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { UpdateServiceProviderPortfolioUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/update-service-provider-portfolio";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateServiceProviderPortfolioBodySchema = z.object({
  title: z.string({
    invalid_type_error: "portfolio.title.invalid_type_error",
    required_error: "portfolio.title.invalid_type_error"
  }),
  description: z.string({
    invalid_type_error: "portfolio.description.invalid_type_error",
    required_error: "portfolio.description.invalid_type_error"
  }),
});

type UpdateServiceProviderPortfolioBodySchema = z.infer<typeof updateServiceProviderPortfolioBodySchema>

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class UpdateServiceProviderPortfolioController {
  constructor(
    private updateServiceProviderPortfolio: UpdateServiceProviderPortfolioUseCase,
    private validation: ValidationService
  ) { }

  @Put("portfolio/:id")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("id") portfolioId: string,
    @Body() data: UpdateServiceProviderPortfolioBodySchema
  ) {
    try {
      await this.validation.validateData(updateServiceProviderPortfolioBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.updateServiceProviderPortfolio.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      title: data.title,
      id: portfolioId,
      description: data.description
    });

    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }

    return {
      next_step: response.value.nextStep ?? undefined
    };
  }
}