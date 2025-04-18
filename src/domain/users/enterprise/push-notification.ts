import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export type PushNotificationStatus = "PENDING" | "SENDED";

export type PushNotificationRedirectTo =
  | "JOBDETAILS"
  | "DASHBOARD"
  | "EMPTY"
  | "BOOKINGDETAILS"
  | "QUOTATIONDETAILS"
  | "TRANSACTIONDETAILS";

export interface PushNotificationProps {
  userId: UniqueEntityID;
  userName?: string;
  notificationToken?: string;
  title: string;
  titleEn: string;
  status: PushNotificationStatus;
  description: string;
  descriptionEn: string;
  redirectTo: PushNotificationRedirectTo;
  parentId: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class PushNotification extends Entity<PushNotificationProps> {
  get userId() {
    return this.props.userId;
  }
  get title() {
    return this.props.title;
  }
  get userName() {
    return this.props.userName;
  }
  get notificationToken() {
    return this.props.notificationToken;
  }
  get titleEn() {
    return this.props.titleEn;
  }
  get status() {
    return this.props.status;
  }
  get redirectTo() {
    return this.props.redirectTo;
  }
  get description() {
    return this.props.description;
  }
  get descriptionEn() {
    return this.props.descriptionEn;
  }
  get parentId() {
    return this.props.parentId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: PushNotificationProps, id?: UniqueEntityID) {
    const notification = new PushNotification(props, id);

    return notification;
  }
}
