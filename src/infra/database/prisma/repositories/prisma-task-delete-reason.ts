import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { TaskDeleteReasonRepository } from "@/domain/work/application/repositories/task-delete-reason-repository";
import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { TaskDeleteReason } from "@/domain/work/enterprise/task-delete-reason";
import { PrismaTaskDeleteReasonMapper } from "../mappers/prisma-task-delete-reason-mapper";
import { Prisma, TaskDeleteReason as PrismaTaskDeleteReason } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaTaskDeleteReasonRepository implements TaskDeleteReasonRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<TaskDeleteReason | null> {
    const response = await this.prisma.taskDeleteReason.findFirst({
      where: {
        value: title
      }
    });

    if (!response) return null;

    return PrismaTaskDeleteReasonMapper.toDomain(response);
  }

  async findMany(params: PaginationParams): Promise<Pagination<TaskDeleteReason>> {
    const page = params.page;

    const list = await this.paginate({
      page,
      perPage: params.perPage
    });

    return {
      data: list.data.map(PrismaTaskDeleteReasonMapper.toDomain),
      meta: list.meta
    };
  }
  async findById(id: string): Promise<TaskDeleteReason | null> {
    const response = await this.prisma.taskDeleteReason.findUnique({
      where: {
        id
      }
    });

    if (!response) return null;

    return PrismaTaskDeleteReasonMapper.toDomain(response);
  }
  async create(reason: TaskDeleteReason): Promise<TaskDeleteReason> {
    const data = PrismaTaskDeleteReasonMapper.toPrisma(reason);

    const created = await this.prisma.taskDeleteReason.create({
      data: {
        value: data.value,
      }
    });

    return PrismaTaskDeleteReasonMapper.toDomain(created)
  }
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.TaskDeleteReasonWhereInput,
    orderBy?: Prisma.TaskDeleteReasonOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaTaskDeleteReason>> {
    return paginate(
      this.prisma.taskDeleteReason,
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