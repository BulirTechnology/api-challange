import { Pagination } from "@/core/repositories/pagination-params";
import { Notification, NotificationType } from "../../enterprise/notification";
import { NotificationFindById, NotificationPaginationParams } from "../params/notification-params";

export abstract class NotificationsRepository {
  abstract countUnreadedNotifications(params: { userId: string }): Promise<number>
  abstract findManyByUserId(data: NotificationPaginationParams): Promise<Pagination<Notification>>
  abstract findById(params: NotificationFindById): Promise<Notification | null>
  abstract create(notification: Notification): Promise<void>
  abstract deleteMany(userId: string): Promise<void>
  abstract delete(notificationId: string): Promise<void>
  abstract setAllAsReaded(params: { userId: string }): Promise<void>
  abstract setAsReaded(notificationId: string, userId: string): Promise<void>
  abstract findByUserIdAndType(data: { userId: string, type: NotificationType, language: "pt" | "en" }): Promise<Notification | null>
}
