import {
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Param,
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
import { I18nContext, I18nService } from "nestjs-i18n";
import { DeleteNotificationItemUseCase } from "@/domain/users/application/use-cases/user/notification/delete-user-notification-item";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class DeleteNotificationItemController {
  constructor(
    private deleteNotificationItem: DeleteNotificationItemUseCase,
    private readonly i18n: I18nService
  ) { }

  @Delete("notifications/:notificationId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("notificationId") notificationId: string,
  ) {
    const result = await this.deleteNotificationItem.execute({
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
      else
        throw new BadRequestException(error.message);
    }
  }
}