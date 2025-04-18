import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { NotificationsRepository, PushNotificationRepository } from "@/domain/users/application/repositories";
import {
  LanguageSlug,
  Notification,
  NotificationType,
  PushNotification,
  PushNotificationRedirectTo
} from "@/domain/users/enterprise";

export async function createNotificationRegister({
  descriptionEn,
  descriptionPt,
  notificationRepository,
  pushNotificationRepository,
  parentId,
  titleEn,
  titlePt,
  type,
  userId,
  pushNotificationRedirectTo
}: {
  language: LanguageSlug
  descriptionPt: string
  descriptionEn: string,
  parentId: string | null,
  titlePt: string,
  titleEn: string
  type: NotificationType
  userId: UniqueEntityID
  pushNotificationRedirectTo: PushNotificationRedirectTo
  notificationRepository: NotificationsRepository,
  pushNotificationRepository: PushNotificationRepository
}) {
  const notification = Notification.create({
    description: descriptionPt,
    descriptionEn,
    parentId,
    readed: false,
    title: titlePt,
    titleEn,
    type,
    userId,
  });

  const pushNotification = PushNotification.create({
    description: descriptionPt,
    descriptionEn: descriptionEn,
    parentId,
    status: "PENDING",
    title: titlePt,
    titleEn: titleEn,
    userId,
    redirectTo: pushNotificationRedirectTo
  });

  await pushNotificationRepository.create(pushNotification);
  return await notificationRepository.create(notification);
}