import {
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Patch,
  Param,
  ConflictException,
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

import { InvalidNotificationError } from "@/domain/users/application/use-cases/errors/invalid-notification-error";
import { SetUserNotificationReadedUseCase } from "@/domain/users/application/use-cases/user/notification/set-user-notification-readed";
import { I18nContext, I18nService } from "nestjs-i18n";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class SetUserNotificationReadedController {
  constructor(
    private setNotificationReaded: SetUserNotificationReadedUseCase,
    private readonly i18n: I18nService
  ) { }

  @Patch("notifications/:notificationId/readed")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("notificationId") notificationId: string,
  ) {
    const result = await this.setNotificationReaded.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      notificationId,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else if (error.constructor == InvalidNotificationError)
        throw new ConflictException(this.i18n.t("errors.notification.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}