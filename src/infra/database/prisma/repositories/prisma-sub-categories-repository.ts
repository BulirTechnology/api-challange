import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { SubCategoriesRepository } from "@/domain/work/application/repositories/sub-category-repository";
import { SubCategory } from "@/domain/work/enterprise/sub-category";
import { PrismaSubCategoryMapper } from "../mappers/prisma-sub-category-mapper";
import { SubCategoryFindById, SubCategoryPaginationParams } from "@/domain/work/application/params/sub-category-params";
import { Pagination } from "@/core/repositories/pagination-params";
import { Prisma, SubCategory as PrismaSubCategory } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaSubCategoriesRepository implements SubCategoriesRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<SubCategory | null> {
    const category = await this.prisma.subCategory.findFirst({
      where: {
        title
      }
    });

    if (!category) return null;

    return PrismaSubCategoryMapper.toDomain(category, "pt");
  }

  async update(category: SubCategory): Promise<SubCategory | null> {
    const data = PrismaSubCategoryMapper.toPrisma(category);

    const updated = await this.prisma.subCategory.update({
      data: {
        title: data.title,
        titleEn: data.titleEn,
      },
      where: {
        id: category.id.toString()
      }
    });

    return PrismaSubCategoryMapper.toDomain(updated);
  }
  async updateImage(categoryId: string, url: string): Promise<void> {
    await this.prisma.subCategory.update({
      where: {
        id: categoryId
      },
      data: {
        url
      }
    });
  }
  async findMany(params: SubCategoryPaginationParams): Promise<Pagination<SubCategory>> {
    const result = await this.paginate({
      where: {
        categoryId: params.categoryId ? params.categoryId : {}
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: result.data.map(item => PrismaSubCategoryMapper.toDomain(item, params.language)),
      meta: result.meta
    };
  }
  async findById(params: SubCategoryFindById): Promise<SubCategory | null> {
    const category = await this.prisma.subCategory.findUnique({
      where: {
        id: params.id
      }
    });

    if (!category) return null;

    return PrismaSubCategoryMapper.toDomain(category, params.language);
  }
  async create(category: SubCategory): Promise<SubCategory> {
    const data = PrismaSubCategoryMapper.toPrisma(category);

    const result = await this.prisma.subCategory.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        url: data.url,
        categoryId: data.categoryId,
        hasSubSubCategory: data.hasSubSubCategory
      }
    });

    return PrismaSubCategoryMapper.toDomain(result, "pt")
  }
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.SubCategoryWhereInput,
    orderBy?: Prisma.SubCategoryOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaSubCategory>> {
    return paginate(
      this.prisma.subCategory,
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