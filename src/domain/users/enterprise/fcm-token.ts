import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface FcmTokenProps {
  deviceType: "android" | "ios" | "web"
  notificationToken: string
  status: "ACTIVE" | "INACTIVE"
  userId: string
  createdAt: Date
  updatedAt?: Date | null
}

export class FcmToken extends Entity<FcmTokenProps> {
  get deviceType() {
    return this.props.deviceType;
  }
  get userId() {
    return this.props.userId;
  }
  get status() {
    return this.props.status;
  }
  get notificationToken() {
    return this.props.notificationToken;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  
  static create(props: Optional<FcmTokenProps, "createdAt">, id?: UniqueEntityID) {

    const fcmToken = new FcmToken({
      deviceType: props.deviceType,
      userId: props.userId,
      status: props.status,
      notificationToken: props.notificationToken,
      updatedAt: props.updatedAt,
      createdAt: props.createdAt ?? new Date()
    }, id);

    return fcmToken;
  }
}
