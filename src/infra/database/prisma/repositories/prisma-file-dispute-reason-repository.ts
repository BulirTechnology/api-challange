import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { FileDisputeReasonRepository } from "@/domain/work/application/repositories/file-dispute-reason-repository";
import { FileDisputeReason } from "@/domain/work/enterprise/file-dispute-reason";
import { PrismaFileDisputeReasonMapper } from "../mappers/prisma-file-dispute-reason-mapper";
import { FileDisputeFindById, FileDisputePaginationParams } from "@/domain/work/application/params/file-dispute-reason-params";
import { Prisma, FileDisputeReason as PrismaFileDisputeReason } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Pagination } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaFileDisputeReasonRepository implements FileDisputeReasonRepository {
  constructor(private prisma: PrismaService) { }

  async findByName(name: string): Promise<FileDisputeReason | null> {
    const result = await this.prisma.fileDisputeReason.findFirst({
      where: {
        value: name
      }
    })

    if (!result) return null

    return PrismaFileDisputeReasonMapper.toDomain(result, "pt")
  }

  async findMany(params: FileDisputePaginationParams): Promise<Pagination<FileDisputeReason>> {
    const page = params.page;

    const list = await this.paginate({
      page,
      perPage: params.perPage
    });

    return {
      data: list.data.map(item => PrismaFileDisputeReasonMapper.toDomain(item, params.language)),
      meta: list.meta
    };
  }
  async findById(params: FileDisputeFindById): Promise<FileDisputeReason | null> {
    const response = await this.prisma.fileDisputeReason.findUnique({
      where: {
        id: params.id
      }
    });

    if (!response) return null;

    return PrismaFileDisputeReasonMapper.toDomain(response, params.language);
  }
  async create(reason: FileDisputeReason): Promise<FileDisputeReason> {
    const data = PrismaFileDisputeReasonMapper.toPrisma(reason);

    const created = await this.prisma.fileDisputeReason.create({
      data: {
        value: data.value,
        valueEn: data.valueEn
      }
    });

    return PrismaFileDisputeReasonMapper.toDomain(created, "pt")
  }
  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.FileDisputeReasonWhereInput,
    orderBy?: Prisma.FileDisputeReasonOrderByWithRelationInput,
    include?: Prisma.FileDisputeReasonInclude,
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaFileDisputeReason>> {
    return paginate(
      this.prisma.fileDisputeReason,
      {
        where,
        orderBy,
        include
      },
      {
        page,
        perPage,
      },
    );
  }


}