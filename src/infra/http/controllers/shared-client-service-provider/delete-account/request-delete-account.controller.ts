import {
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { RequestDeleteAccountUseCase } from "@/domain/users/application/use-cases/user/account/request-delete-account";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class RequestDeleteAccountController {
  constructor(
    private requestDeleteAccountUseCase: RequestDeleteAccountUseCase
  ) { }

  @Post("delete")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload
  ) {
    console.log("entrou aqui");
    const response = await this.requestDeleteAccountUseCase.execute({
      userId: user.sub,
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }
  }
}