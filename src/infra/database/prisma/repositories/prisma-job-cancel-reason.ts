import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { JobCancelReasonRepository } from "@/domain/work/application/repositories/job-cancel-reason-repository";
import { JobCancelReason } from "@/domain/work/enterprise/job-cancel-reason";
import { PrismaJobCancelReasonMapper } from "../mappers/prisma-job-cancel-reason-mapper";
import { JobCancelReasonFindById, JobCancelReasonPaginationParams } from "@/domain/work/application/params/job-cancel-reason-params";
import { Prisma, JobCancelReason as PrismaJobCancelReason } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Pagination } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaJobCancelReasonRepository implements JobCancelReasonRepository {
  constructor(private prisma: PrismaService) { }

  async findByName(params: { language: "pt" | "en", name: string }): Promise<JobCancelReason | null> {
    const response = await this.prisma.jobCancelReason.findFirst({
      where: {
        value: params.language === "pt" ? {
          equals: params.name
        } : {},
        valueEn: params.language === "en" ? {
          equals: params.name
        } : {},
      }
    });

    if (!response) return null;

    return PrismaJobCancelReasonMapper.toDomain(response, params.language);
  }

  async findMany(params: JobCancelReasonPaginationParams): Promise<Pagination<JobCancelReason>> {
    const list = await this.paginate({
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: list.data.map(item => PrismaJobCancelReasonMapper.toDomain(item, params.language)),
      meta: list.meta
    };
  }
  async findById(params: JobCancelReasonFindById): Promise<JobCancelReason | null> {
    const response = await this.prisma.jobCancelReason.findUnique({
      where: {
        id: params.id
      }
    });

    if (!response) return null;

    return PrismaJobCancelReasonMapper.toDomain(response, params.language);
  }
  async create(reason: JobCancelReason): Promise<JobCancelReason> {
    const data = PrismaJobCancelReasonMapper.toPrisma(reason);

    const result = await this.prisma.jobCancelReason.create({
      data: {
        value: data.value,
        valueEn: data.valueEn
      }
    });

    return PrismaJobCancelReasonMapper.toDomain(result, "pt")
  }
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.JobCancelReasonWhereInput,
    orderBy?: Prisma.JobCancelReasonOrderByWithRelationInput,
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaJobCancelReason>> {
    return paginate(
      this.prisma.jobCancelReason,
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