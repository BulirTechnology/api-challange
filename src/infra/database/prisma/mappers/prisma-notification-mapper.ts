import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Notification } from "@/domain/users/enterprise/notification";
import { Notification as PrismaNotification } from "@prisma/client";

export class PrismaNotificationMapper {
  static toDomain(info: PrismaNotification, language: "en" | "pt"): Notification {
    return Notification.create({
      title: language === "en" ? info.titleEn : info.title,
      description: language === "en" ? info.descriptionEn : info.description,
      descriptionEn: info.descriptionEn,
      titleEn: info.titleEn,
      readed: info.readed,
      userId: new UniqueEntityID(info.userId),
      type: info.type,
      parentId: info.parentId,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(notification: Notification): PrismaNotification {
    return {
      id: notification.id.toString(),
      title: notification.title,
      description: notification.description,
      titleEn: notification.titleEn,
      descriptionEn: notification.descriptionEn,
      readed: notification.readed,
      type: notification.type,
      userId: notification.userId.toValue(),
      parentId: notification.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}