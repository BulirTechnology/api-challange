import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { SubSubCategoriesRepository } from "@/domain/work/application/repositories/sub-sub-category-repository";
import { SubSubCategory } from "@/domain/work/enterprise/sub-sub-category";
import { PrismaSubSubCategoryMapper } from "../mappers/prisma-sub-sub-category-mapper";
import { SubSubCategoryFindById, SubSubCategoryPaginationParams } from "@/domain/work/application/params/sub-sub-category-params";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Pagination } from "@/core/repositories/pagination-params";
import { Prisma, SubSubCategory as PrismaSubSubCategory } from "@prisma/client";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaSubSubCategoriesRepository implements SubSubCategoriesRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<SubSubCategory | null> {
    const category = await this.prisma.subSubCategory.findFirst({
      where: {
        title
      }
    });

    if (!category) return null;

    return PrismaSubSubCategoryMapper.toDomain(category, "pt");
  }

  async update(category: SubSubCategory): Promise<SubSubCategory> {
    const data = PrismaSubSubCategoryMapper.toPrisma(category);

    const result = await this.prisma.subSubCategory.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        url: data.url,
        subCategoryId: data.subCategoryId
      },
    });

    return PrismaSubSubCategoryMapper.toDomain(result);
  }
  async updateImage(categoryId: string, url: string): Promise<void> {
    await this.prisma.subSubCategory.update({
      where: {
        id: categoryId
      },
      data: {
        url
      }
    });
  }
  async findMany(params: SubSubCategoryPaginationParams): Promise<Pagination<SubSubCategory>> {
    const result = await this.paginate({
      where: {
        subCategoryId: params.subCategoryId ? params.subCategoryId : {}
      },
      orderBy: {
        createdAt: "desc",
      },
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: result.data.map(item => PrismaSubSubCategoryMapper.toDomain(item, params.language)),
      meta: result.meta
    };
  }
  async findById(params: SubSubCategoryFindById): Promise<SubSubCategory | null> {
    const category = await this.prisma.subSubCategory.findUnique({
      where: {
        id: params.id
      }
    });

    if (!category) return null;

    return PrismaSubSubCategoryMapper.toDomain(category, params.language);
  }
  async create(category: SubSubCategory): Promise<SubSubCategory> {
    const data = PrismaSubSubCategoryMapper.toPrisma(category);

    const result = await this.prisma.subSubCategory.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        url: data.url,
        subCategoryId: data.subCategoryId
      },
    });

    return PrismaSubSubCategoryMapper.toDomain(result, "pt")
  }
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.SubSubCategoryWhereInput,
    orderBy?: Prisma.SubSubCategoryOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaSubSubCategory>> {
    return paginate(
      this.prisma.subSubCategory,
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