import { Injectable } from "@nestjs/common";
import {
  PaginatorTypes,
  paginator
} from "@nodeteam/nestjs-prisma-pagination";
import {
  Prisma,
  Promotion as PrismaPromotion
} from "@prisma/client";

import { PromotionsRepository } from "@/domain/work/application/repositories/promotion-repository";
import { Promotion } from "@/domain/work/enterprise/promotion";
import {
  PromotionFindByCode,
  PromotionFindById,
  PromotionPaginationParams
} from "@/domain/work/application/params/promotion-params";

import { Pagination } from "@/core/repositories/pagination-params";

import { PrismaPromotionMapper } from "../mappers/prisma-promotion-mapper";
import { PrismaService } from "../prisma.service";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaPromotionsRepository implements PromotionsRepository {
  constructor(private prisma: PrismaService) { }

  async findByCode(params: PromotionFindByCode): Promise<Promotion | null> {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        name: params.name,
      }
    });

    return promotion ? PrismaPromotionMapper.toDomain(promotion, params.language) : null;
  }

  async findMany(params: PromotionPaginationParams): Promise<Pagination<Promotion>> {
    const promotions = await this.paginate({
      orderBy: { createdAt: "desc", },
      page: params.page ?? 1,
      perPage: params.perPage
    });

    return {
      data: promotions.data.map(item => PrismaPromotionMapper.toDomain(item, params.language)),
      meta: promotions.meta
    };
  }

  async findById(params: PromotionFindById): Promise<Promotion | null> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: params.id }
    });

    return promotion ? PrismaPromotionMapper.toDomain(promotion, params.language) : null;
  }

  async create(promotion: Promotion): Promise<void> {
    const data = PrismaPromotionMapper.toPrisma(promotion);

    await this.prisma.promotion.create({ data });
  }

  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.PromotionWhereInput,
    orderBy?: Prisma.PromotionOrderByWithRelationInput
    include?: Prisma.PromotionInclude
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaPromotion>> {
    return paginate(
      this.prisma.promotion,
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