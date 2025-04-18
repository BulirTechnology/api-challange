import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FcmToken } from "@/domain/users/enterprise/fcm-token";
import { NotificationToken as PrismaFcmToken } from "@prisma/client";

export class PrismaFcmTokenMapper {
  static toDomain(info: PrismaFcmToken): FcmToken {
    return FcmToken.create({
      deviceType: info.deviceType as "android" | "ios" | "web",
      notificationToken: info.notificationToken,
      status: info.status,
      userId: info.userId,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(info: FcmToken): PrismaFcmToken {
    return {
      deviceType: info.deviceType as "android" | "ios" | "web",
      notificationToken: info.notificationToken,
      status: info.status,
      userId: info.userId.toString(),
      id: info.id.toString()
    };
  }
}