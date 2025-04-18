import { Injectable } from "@nestjs/common";
import { Prisma, Category as PrismaCategory } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

import {
  CategoryFindById,
  CategoryPaginationParams
} from "@/domain/work/application/params/category-params";
import { CategoriesRepository } from "@/domain/work/application/repositories/category-repository";
import { Category } from "@/domain/work/enterprise/category";

import { PrismaService } from "../prisma.service";
import { PrismaCategoryMapper } from "../mappers/prisma-category-mapper";

import { Pagination } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        title: {
          equals: title
        }
      }
    });

    if (!category) return null;

    return PrismaCategoryMapper.toDomain(category, "pt");
  }

  async update(category: Category, language: "pt" | "en"): Promise<Category> {
    const data = PrismaCategoryMapper.toPrisma(category);

    const item = await this.prisma.category.update({
      where: {
        id: data.id
      },
      data: {
        title: data.title,
        titleEn: data.titleEn,
      }
    });

    return PrismaCategoryMapper.toDomain(item, language);
  }

  async updateImage(categoryId: string, url: string): Promise<void> {
    await this.prisma.category.update({
      where: { id: categoryId },
      data: { url }
    });
  }

  async findMany(params: CategoryPaginationParams): Promise<Pagination<Category>> {
    const categories = await this.paginate({
      orderBy: {
        createdAt: "desc",
      },
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: categories.data.map(item => PrismaCategoryMapper.toDomain(item, params.language)),
      meta: categories.meta
    };
  }

  async findById(params: CategoryFindById): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: params.id
      }
    });

    if (!category) return null;

    return PrismaCategoryMapper.toDomain(category, params.language ?? "pt");
  }

  async create(category: Category): Promise<Category> {
    const data = PrismaCategoryMapper.toPrisma(category);

    const categoryCreated = await this.prisma.category.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        url: data.url,
        priority: data.priority ? data.priority : 1
      }
    });

    return PrismaCategoryMapper.toDomain({
      createdAt: categoryCreated.createdAt,
      id: categoryCreated.id,
      priority: categoryCreated.priority,
      title: categoryCreated.title,
      titleEn: categoryCreated.titleEn,
      updatedAt: categoryCreated.updatedAt,
      url: categoryCreated.url,
    }, "pt")
  }

  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.CategoryWhereInput,
    orderBy?: Prisma.CategoryOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaCategory>> {
    return paginate(
      this.prisma.category,
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