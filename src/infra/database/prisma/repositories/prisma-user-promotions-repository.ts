import { Injectable } from "@nestjs/common";
import {
  Prisma,
  UserPromotion as PrismaUserPromotion,
  Promotion
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

import { PrismaService } from "../prisma.service";
import { PrismaUserPromotionMapper } from "../mappers/prisma-user-promotion-mapper";

import { UserPromotionsRepository } from "@/domain/users/application/repositories/user-promotion-repository";
import { UserPromotion, UserPromotionState } from "@/domain/users/enterprise/user-promotion";

import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

type UserPromotionType = PrismaUserPromotion & {
  promotion: Promotion
}

@Injectable()
export class PrismaUserPromotionsRepository implements UserPromotionsRepository {
  constructor(private prisma: PrismaService) { }

  async findById(id: string): Promise<UserPromotion | null> {
    const item = await this.prisma.userPromotion.findFirst({
      where: {
        id
      },
      include: {
        promotion: true
      }
    });

    if (!item) return null;

    return PrismaUserPromotionMapper.toDomain({
      createdAt: item.createdAt,
      id: item.id,
      promotionId: item.promotionId,
      state: item.state,
      updatedAt: item.updatedAt,
      userId: item.userId,
      expiresAt: item.promotion.expiresAt,
      name: item.promotion.name,
      discount: item.promotion.discount,
      description: item.promotion.description,
      promotionType: item.promotion.promotionType
    });
  }
  async findByPromotionIdAndUserId(params: { promotionId: string; userId: string; }): Promise<UserPromotion | null> {
    const item = await this.prisma.userPromotion.findFirst({
      where: {
        userId: params.userId,
        promotionId: params.promotionId
      },
      include: {
        promotion: true
      }
    });

    if (!item) return null;

    return PrismaUserPromotionMapper.toDomain({
      createdAt: item.createdAt,
      id: item.id,
      promotionId: item.promotionId,
      state: item.state,
      updatedAt: item.updatedAt,
      userId: item.userId,
      expiresAt: item.promotion.expiresAt,
      name: item.promotion.name,
      discount: item.promotion.discount,
      description: item.promotion.description,
      promotionType: item.promotion.promotionType
    });
  }
  async updateState(id: string, state: UserPromotionState): Promise<void> {
    await this.prisma.userPromotion.update({
      where: {
        id
      },
      data: {
        state
      }
    });
  }
  async countUserPromotions(params: { promotionId: string; userId: string; }): Promise<number> {
    const total = await this.prisma.userPromotion.count({
      where: {
        userId: params.userId,
        promotionId: params.promotionId
      }
    });

    return total;
  }
  async findMany(params: PaginationParams & { userId: string; }): Promise<Pagination<UserPromotion>> {
    const list = await this.paginate({
      where: {
        userId: params.userId,
        state: "PENDING",
        promotion: {
          expiresAt: {
            gt: new Date()
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      page: params.page,
      perPage: params.perPage,
      include: {
        promotion: true
      }
    });

    return {
      data: list.data.map(item => PrismaUserPromotionMapper.toDomain({
        createdAt: item.createdAt,
        id: item.id,
        promotionId: item.promotionId,
        state: item.state,
        updatedAt: item.updatedAt,
        userId: item.userId,
        expiresAt: item.promotion.expiresAt,
        name: item.promotion.name,
        discount: item.promotion.discount,
        description: item.promotion.description,
        promotionType: item.promotion.promotionType
      })),
      meta: list.meta
    };
  }
  async countPromotions(promotionCode: string): Promise<number> {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        name: promotionCode
      }
    });
    const total = await this.prisma.userPromotion.count({
      where: {
        id: promotion?.id
      },
    });

    return total;
  }
  async create(userPromotion: UserPromotion): Promise<UserPromotion> {
    const data = PrismaUserPromotionMapper.toPrisma(userPromotion);

    const result = await this.prisma.userPromotion.create({
      data: {
        state: "PENDING",
        promotionId: data.promotionId,
        userId: data.userId
      },
      include: {
        promotion: true
      }
    });

    return PrismaUserPromotionMapper.toDomain({
      createdAt: result.createdAt,
      description: result.promotion.description,
      discount: result.promotion.discount,
      expiresAt: result.promotion.expiresAt,
      id: result.id,
      name: result.promotion.name,
      promotionId: result.promotion.id,
      state: result.state,
      updatedAt: result.updatedAt,
      userId: result.userId,
      promotionType: result.promotion.promotionType
    });
  }
  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.UserPromotionWhereInput,
    orderBy?: Prisma.UserPromotionOrderByWithRelationInput
    page?: number,
    perPage?: number,
    include?: Prisma.UserPromotionInclude
  }): Promise<PaginatorTypes.PaginatedResult<UserPromotionType>> {
    return paginate(
      this.prisma.userPromotion,
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