import { Injectable } from "@nestjs/common";
import {
  Prisma,
  PushNotification as PrismaPushNotification,
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

import { PushNotificationRepository } from "@/domain/users/application/repositories/push-notification-repository";
import { PushNotification } from "@/domain/users/enterprise/push-notification";

import { Pagination } from "@/core/repositories/pagination-params";

import { PrismaService } from "../prisma.service";
import { PrismaPushNotificationMapper } from "../mappers/prisma-push-notification-mapper";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaPushNotificationsRepository
  implements PushNotificationRepository
{
  constructor(private prisma: PrismaService) {}

  async fetchPending(): Promise<Pagination<PushNotification>> {
    const notifications = await this.paginate({
      where: {
        status: "PENDING",
      },
    });

    const result: PushNotification[] = [];
    for (const notification of notifications.data) {
      const user = await this.prisma.user.findUnique({
        where: { id: notification.userId },
      });

      const item = PrismaPushNotificationMapper.toDomain(
        {
          createdAt: notification.createdAt,
          description: notification.description,
          descriptionEn: notification.descriptionEn,
          notificationToken: `${user?.notificationToken}`,
          id: notification.id,
          parentId: notification.parentId,
          status: notification.status,
          title: notification.title,
          titleEn: notification.titleEn,
          updatedAt: notification.updatedAt,
          userId: notification.userId,
          userName: `${user?.email}`,
          redirectTo: notification.redirectTo,
        },
        "pt"
      );

      result.push(item);
    }

    return {
      data: result,
      meta: notifications.meta,
    };
  }

  async delete(notificationId: string): Promise<void> {
    await this.prisma.pushNotification.delete({
      where: { id: notificationId },
    });
  }

  async create(notification: PushNotification): Promise<void> {
    const data = PrismaPushNotificationMapper.toPrisma(notification);

    await this.prisma.pushNotification.create({ data });
  }

  async paginate({
    where,
    orderBy,
    page,
    perPage,
  }: {
    where?: Prisma.PushNotificationWhereInput;
    orderBy?:
      | Prisma.PushNotificationOrderByWithRelationInput
      | Prisma.PushNotificationOrderByWithRelationInput[];
    page?: number;
    perPage?: number;
    include?: Prisma.PushNotificationInclude;
  }): Promise<PaginatorTypes.PaginatedResult<PrismaPushNotification>> {
    return paginate(
      this.prisma.pushNotification,
      {
        where,
        orderBy,
      },
      {
        page,
        perPage,
      }
    );
  }
}
