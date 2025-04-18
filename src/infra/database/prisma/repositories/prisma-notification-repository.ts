import {
  Prisma,
  Notification as PrismaNotification
} from "@prisma/client";
import {
  PaginatorTypes,
  paginator
} from "@nodeteam/nestjs-prisma-pagination";
import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { PrismaNotificationMapper } from "../mappers/prisma-notification-mapper";

import { NotificationsRepository } from "@/domain/users/application/repositories/notification-repository";
import {
  Notification,
  NotificationType
} from "@/domain/users/enterprise/notification";
import {
  NotificationFindById,
  NotificationPaginationParams
} from "@/domain/users/application/params/notification-params";

import { Pagination } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private prisma: PrismaService) { }

  async setAllAsReaded(params: { userId: string; }): Promise<void> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId: params.userId
      },
      data: {
        readed: true
      }
    })

    console.log("valor do result: ", result)
  }

  async countUnreadedNotifications(params: { userId: string; }): Promise<number> {
    return await this.prisma.notification.count({
      where: {
        userId: params.userId,
        readed: false
      }
    })
  }

  async findByUserIdAndType(params: { userId: string; type: NotificationType, language: "pt" | "en" }): Promise<Notification | null> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        userId: params.userId,
        type: params.type
      }
    });

    return notification ? PrismaNotificationMapper.toDomain(notification, params.language) : null;
  }

  async delete(notificationId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: {
        id: notificationId
      }
    });
  }

  async findById(params: NotificationFindById): Promise<Notification | null> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: params.id
      }
    });

    if (!notification) return null;

    return PrismaNotificationMapper.toDomain(notification, params.language);
  }

  async setAsReaded(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.update({
      where: {
        id: notificationId,
        userId
      },
      data: {
        readed: true
      }
    });
  }
  async findManyByUserId(params: NotificationPaginationParams): Promise<Pagination<Notification>> {
    const page = params.page;

    const data = await this.paginate({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc", },
      page,
      perPage: params.perPage
    });

    return {
      data: data.data.map(item => PrismaNotificationMapper.toDomain(item, params.language)),
      meta: data.meta
    };
  }

  async create(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification);

    await this.prisma.notification.create({ data });
  }

  async deleteMany(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: {
        userId
      }
    });
  }
  
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.NotificationWhereInput,
    orderBy?: Prisma.NotificationOrderByWithRelationInput | Prisma.NotificationOrderByWithRelationInput[],
    page?: number,
    perPage?: number,
    include?: Prisma.NotificationInclude
  }): Promise<PaginatorTypes.PaginatedResult<PrismaNotification>> {
    return paginate(
      this.prisma.notification,
      {
        where,
        orderBy,
      },
      {
        page,
        perPage,
      },
    );
  }

}