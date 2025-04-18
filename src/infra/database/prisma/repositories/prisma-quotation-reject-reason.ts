import { Injectable } from "@nestjs/common";
import {
  Prisma,
  QuotationRejectReason as PrismaQuotationRejectReason
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

import { QuotationRejectReasonRepository } from "@/domain/work/application/repositories/quotation-reject-reason-repository";
import { QuotationRejectReason } from "@/domain/work/enterprise/quotation-reject-reason";
import {
  Pagination,
  PaginationParams
} from "@/core/repositories/pagination-params";

import { PrismaService } from "../prisma.service";
import { PrismaQuotationRejectReasonMapper } from "../mappers/prisma-quotation-reject-reason-mapper";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaQuotationRejectReasonRepository implements QuotationRejectReasonRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<QuotationRejectReason | null> {
    const response = await this.prisma.quotationRejectReason.findFirst({
      where: { value: title }
    });

    return response ? PrismaQuotationRejectReasonMapper.toDomain(response) : null;
  }

  async findMany(params: PaginationParams): Promise<Pagination<QuotationRejectReason>> {
    const page = params.page;

    const list = await this.paginate({
      page,
      perPage: params.perPage,
    });

    return {
      data: list.data.map(PrismaQuotationRejectReasonMapper.toDomain),
      meta: list.meta
    };
  }

  async findById(id: string): Promise<QuotationRejectReason | null> {
    const response = await this.prisma.quotationRejectReason.findUnique({
      where: { id }
    });

    return response ? PrismaQuotationRejectReasonMapper.toDomain(response) : null;
  }

  async create(reason: QuotationRejectReason): Promise<QuotationRejectReason> {
    const data = PrismaQuotationRejectReasonMapper.toPrisma(reason);

    const result = await this.prisma.quotationRejectReason.create({ data });

    return PrismaQuotationRejectReasonMapper.toDomain(result)
  }

  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.QuotationRejectReasonWhereInput,
    orderBy?: Prisma.QuotationRejectReasonOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaQuotationRejectReason>> {
    return paginate(
      this.prisma.quotationRejectReason,
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