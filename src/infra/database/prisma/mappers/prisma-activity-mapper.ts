import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Activity } from "@/domain/users/enterprise/activity";
import { Activity as PrismaActivity } from "@prisma/client";

export class PrismaActivityMapper {
  static toDomain(info: PrismaActivity): Activity {
    return Activity.create({
      activity: info.activity,
      createdAt: info.createdAt,
      userId: new UniqueEntityID(info.userId)
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(activity: Activity): PrismaActivity {
    return {
      id: activity.id.toString(),
      activity: activity.activity,
      userId: activity.userId.toString(),
      createdAt: new Date(),
    };
  }
}