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
import { RefreshTokenUserUseCase } from "@/domain/users/application/use-cases/user/refresh-user-token";
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { RefreshPayload } from "@/infra/auth/refresh-token.strategy";

@ApiTags("Sessions")
@Controller("/sessions")
export class RefreshTokenController {
  constructor(
    private refreshTokenUser: RefreshTokenUserUseCase
  ) { }

  @Post("refresh")
  @UseGuards(AuthGuard(["jwt"]))
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: RefreshPayload) {
    if (user.type !== "refresh") {
      throw new UnauthorizedException("");
    }

    const result = await this.refreshTokenUser.execute({
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

    return {
      access_token: result.value.token,
      refresh_token: result.value.refreshToken
    };
  }
}
