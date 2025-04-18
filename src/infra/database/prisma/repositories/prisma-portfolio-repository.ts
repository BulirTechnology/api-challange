import { Injectable } from "@nestjs/common";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import {
  Prisma,
  Portfolio as PrismaPortfolio
} from "@prisma/client";

import { PortfoliosRepository } from "@/domain/users/application/repositories/portfolio-repository";
import { Portfolio } from "@/domain/users/enterprise/portfolio";

import { PrismaService } from "../prisma.service";
import { PrismaPortfolioMapper } from "../mappers/prisma-portfolio-mapper";

import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaPortfoliosRepository implements PortfoliosRepository {
  constructor(private prisma: PrismaService) { }

  async findMany(params: PaginationParams & { serviceProviderId: string }): Promise<Pagination<Portfolio>> {
    const page = params.page;

    const data = await this.paginate({
      orderBy: { createdAt: "desc", },
      page,
      perPage: params.perPage,
      where: params.serviceProviderId ? {
        serviceProviderId: params.serviceProviderId
      } : {}
    });

    return {
      data: data.data.map(PrismaPortfolioMapper.toDomain),
      meta: data.meta
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.portfolio.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<Portfolio | null> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id }
    });

    return portfolio ? PrismaPortfolioMapper.toDomain(portfolio) : null;
  }

  async update(id: string, portfolio: Portfolio): Promise<void> {
    const data = PrismaPortfolioMapper.toPrisma(portfolio);

    await this.prisma.portfolio.update({
      data,
      where: { id }
    });
  }

  async create(portfolio: Portfolio): Promise<Portfolio> {
    const data = PrismaPortfolioMapper.toPrisma(portfolio);

    const response = await this.prisma.portfolio.create({ data });

    return PrismaPortfolioMapper.toDomain(response);
  }

  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.PortfolioWhereInput,
    orderBy?: Prisma.PortfolioOrderByWithRelationInput
    include?: Prisma.PortfolioInclude
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaPortfolio>> {
    return paginate(
      this.prisma.portfolio,
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