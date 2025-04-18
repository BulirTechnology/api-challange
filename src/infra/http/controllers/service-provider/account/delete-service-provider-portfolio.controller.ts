import {
  Controller,
  BadRequestException,
  Param,
  NotFoundException,
  Delete,
  UseGuards,
  Headers
} from "@nestjs/common";

import { DeleteServiceProviderPortfolioUseCase } from "@/domain/users/application/use-cases/service-provider/portfolio/delete-service-provider-portfolio";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class DeleteServiceProviderPortfolioController {
  constructor(
    private deleteServiceProviderPortfolio: DeleteServiceProviderPortfolioUseCase
  ) { }

  @Delete("portfolio/:id")
  @ApiResponse({ status: 200, description: "Successful response. User account was created" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("id") portfolioId: string,
  ) {
    const response = await this.deleteServiceProviderPortfolio.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      id: portfolioId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException(error.message);
    }
  }
}