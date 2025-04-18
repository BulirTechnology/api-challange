import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PushNotification } from "@/domain/users/enterprise/push-notification";
import { PushNotification as PrismaPushNotification } from "@prisma/client";

export type PrismaPushNotificationType = PrismaPushNotification & {
  userName: string;
  notificationToken: string;
};

export class PrismaPushNotificationMapper {
  static toDomain(
    info: PrismaPushNotification & {
      userName: string;
      notificationToken: string;
    },
    language: "en" | "pt"
  ): PushNotification {
    return PushNotification.create(
      {
        title: language === "en" ? info.titleEn : info.title,
        description: language === "en" ? info.descriptionEn : info.description,
        descriptionEn: info.descriptionEn,
        notificationToken: info.notificationToken,
        userName: info.userName,
        titleEn: info.titleEn,
        userId: new UniqueEntityID(info.userId),
        parentId: info.parentId,
        status: info.status,
        redirectTo: info.redirectTo,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt,
      },
      new UniqueEntityID(info.id)
    );
  }

  static toPrisma(notification: PushNotification): PrismaPushNotification {
    return {
      id: notification.id.toString(),
      title: notification.title,
      description: notification.description,
      titleEn: notification.titleEn,
      descriptionEn: notification.descriptionEn,
      status: notification.status,
      userId: notification.userId.toValue(),
      parentId: notification.parentId,
      redirectTo: notification.redirectTo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
