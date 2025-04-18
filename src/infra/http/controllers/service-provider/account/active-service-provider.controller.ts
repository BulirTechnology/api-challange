import {
  Controller,
  Post,
  BadRequestException,
  UseGuards,
  Headers
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ActiveServiceProviderUseCase } from "@/domain/users/application/use-cases/service-provider/details/active-service-provider";

@ApiTags("ServiceProviders")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class ActiveServiceProviderController {
  constructor(
    private activeServiceProviderUseCase: ActiveServiceProviderUseCase,
  ) { }

  @Post("active")
  @ApiResponse({ status: 201, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
  ) {
    const response = await this.activeServiceProviderUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
    });

    if (response.isLeft()) {
      const error = response.value;

      throw new BadRequestException(error.message);
    }

    return {
    };
  }
}