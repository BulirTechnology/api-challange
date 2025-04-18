import {
  Controller,
  BadRequestException,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Headers
} from "@nestjs/common";

import { DeleteServiceProviderSpecializationUseCase } from "@/domain/users/application/use-cases/service-provider/specialization/delete-service-provider-specialization";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class DeleteServiceProviderSpecializationController {
  constructor(
    private deleteServiceProviderSpecialization: DeleteServiceProviderSpecializationUseCase
  ) { }

  @Delete("specialization/:id")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("id") specializationId: string
  ) {
    const response = await this.deleteServiceProviderSpecialization.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      id: specializationId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);
      else
        throw new BadRequestException(error.message);
    }
  }
}