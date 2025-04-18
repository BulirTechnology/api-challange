import {
  BadRequestException,
  Controller,
  Body,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { I18nContext, I18nService } from "nestjs-i18n";
import { UpdateUserNotificationTokenUseCase } from "@/domain/users/application/use-cases/user/update-user-notification-token";

class UpdateNotificationTokenDto {
  notificationToken!: string;
}

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdateNotificationTokenController {
  constructor(
    private readonly i18n: I18nService,
    private readonly updateExpoNotification: UpdateUserNotificationTokenUseCase
  ) {}

  @Put("notification-token")
  @ApiOperation({ summary: "Update the user's notification token" })
  @ApiBody({
    description: "The new notification token",
    required: true,
    type: UpdateNotificationTokenDto,
  })
  @ApiResponse({
    status: 200,
    description: "Notification token updated successfully",
    schema: {
      example: {
        message: "Notification token updated successfully",
        notificationToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxx]",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request",
    schema: {
      example: {
        statusCode: 400,
        message: "Notification token is missing",
        error: "Bad Request",
      },
    },
  })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: UpdateNotificationTokenDto
  ) {
    const { notificationToken } = data;

    if (!notificationToken) {
      throw new BadRequestException(
        this.i18n.t("errors.user.notification_token.invalid_type_error", {
          lang: I18nContext.current()?.lang,
        })
      );
    }

    await this.updateExpoNotification.execute({
      userId: user.sub,
      notificationToken,
    });

    return {
      message: this.i18n.t("errors.user.notification_token.updated", {
        lang: I18nContext.current()?.lang,
      }),
      notificationToken,
    };
  }
}
