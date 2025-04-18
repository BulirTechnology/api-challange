import { Notification } from "@/domain/users/enterprise/notification";

export class NotificationPresenter {
  static toHTTP(notification: Notification) {
    return {
      id: notification.id.toString(),
      description: notification.description,
      readed: notification.readed,
      title: notification.title,
      type: notification.type,
      user_id: notification.userId.toString(),
      parent_id: notification.parentId,
      created_at: notification.createdAt,
      updated_at: notification.updatedAt
    };
  }
}