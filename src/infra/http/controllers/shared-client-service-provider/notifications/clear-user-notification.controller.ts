import {
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Delete,
  Headers,
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ClearUserNotificationUseCase } from "@/domain/users/application/use-cases/user/notification/clear-user-notification";
import { I18nContext, I18nService } from "nestjs-i18n";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class ClearUserNotificationController {
  constructor(
    private updateUserAddress: ClearUserNotificationUseCase,
    private readonly i18n: I18nService
  ) { }

  @Delete("notifications")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
  ) {

    const result = await this.updateUserAddress.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));

      throw new BadRequestException(error.message);
    }
  }
}