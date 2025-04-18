import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { NotificationsRepository } from "../../../repositories";
import { InvalidNotificationError } from "../../errors/invalid-notification-error";

interface DeleteNotificationItemUseCaseRequest {
  language: "en" | "pt"
  userId: string
  notificationId: string
}

type DeleteNotificationItemUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class DeleteNotificationItemUseCase {
  constructor(
    private notificationsRepository: NotificationsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    notificationId,
    language
  }: DeleteNotificationItemUseCaseRequest): Promise<DeleteNotificationItemUseCaseResponse> {
    const notification = await this.notificationsRepository.findById({
      id: notificationId,
      language
    });
    console.log("dados da notificacao: ", notification);
    if (!notification) {
      return left(new ResourceNotFoundError(this.i18n.t("errors.notification.not_found",
        { lang: I18nContext.current()?.lang })
      ));
    }

    if (notification?.userId.toString() !== userId) {
      return left(new InvalidNotificationError());
    }

    await this.notificationsRepository.delete(notification.id.toString());

    return right(null);
  }
}
