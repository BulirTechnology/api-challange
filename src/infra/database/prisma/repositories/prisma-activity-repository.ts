import { Injectable } from "@nestjs/common";
import {
  PaginatorTypes,
  paginator
} from "@nodeteam/nestjs-prisma-pagination";

import { ActivityRepository } from "@/domain/users/application/repositories/activity-repository";
import { Activity } from "@/domain/users/enterprise/activity";

import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";

import { PrismaService } from "../prisma.service";
import { PrismaActivityMapper } from "../mappers/prisma-activity-mapper";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaActivityRepository implements ActivityRepository {
  constructor(private prisma: PrismaService) { }

  async findMany(params: PaginationParams & { userId?: string; }): Promise<Pagination<Activity>> {
    const result: PaginatorTypes.PaginatedResult<Activity> = await paginate(
      this.prisma.activity,
      {
        where: {},
        orderBy: [],
      },
      {
        page: params.page,
        perPage: params.perPage,
      },
    );

    return {
      data: result.data,
      meta: result.meta
    };
  }
  async create(activity: Activity): Promise<void> {
    const activityToCreate = PrismaActivityMapper.toPrisma(activity);
    await this.prisma.activity.create({
      data: {
        activity: activityToCreate.activity,
        userId: activityToCreate.userId
      }
    });
  }
}