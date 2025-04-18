import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WrongCredentialsError } from "@/domain/users/application/use-cases/errors/wrong-credentials-error";

import { AuthGuard } from "@nestjs/passport";
import { LogoutUserUseCase } from "@/domain/users/application/use-cases/user/logout-user";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthPayload } from "@/infra/auth/jwt.strategy";

@ApiTags("Sessions")
@Controller("/sessions")
export class LogoutController {
  constructor(
    private logoutUser: LogoutUserUseCase
  ) { }

  @Post("logout")
  @UseGuards(AuthGuard("jwt"))
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload) {
    const result = await this.logoutUser.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
      case WrongCredentialsError:
        throw new UnauthorizedException(error.message);
      default:
        throw new BadRequestException(error.message);
      }
    }
  }
}
