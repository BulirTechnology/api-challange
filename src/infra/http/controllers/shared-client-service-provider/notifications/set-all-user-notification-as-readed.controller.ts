import {
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Patch,
  Param,
  ConflictException,
  Headers,
  Post,
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
import { I18nContext, I18nService } from "nestjs-i18n";
import { SetAllUserNotificationReadedUseCase } from "@/domain/users/application/use-cases/user/notification/set-all-user-notification-readed";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class SetAllUserNotificationReadedController {
  constructor(
    private setAllNotificationReaded: SetAllUserNotificationReadedUseCase,
    private readonly i18n: I18nService
  ) { }

  @Post("notifications/all_readed")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
  ) {
    console.log("entrou aqui dentro:")
    const result = await this.setAllNotificationReaded.execute({
      userId: user.sub,
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