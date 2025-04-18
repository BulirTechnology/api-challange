import { Injectable } from "@nestjs/common";
import {
  Prisma,
  Services as PrismaServicesItem
} from "@prisma/client";

import { ServicesRepository } from "@/domain/work/application/repositories/service-repository";
import { Service } from "@/domain/work/enterprise/service";

import { PrismaService } from "../prisma.service";
import { PrismaServiceMapper } from "../mappers/prisma-service-mapper";

import {
  ServiceFindById,
  ServiceManyBySubCategory,
  ServicePaginationParams
} from "@/domain/work/application/params/service-params";

import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Pagination } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaServicesRepository implements ServicesRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<Service | null> {
    const service = await this.prisma.services.findFirst({
      where: {
        title
      }
    });

    if (!service) return null;

    return PrismaServiceMapper.toDomain(service, "pt");
  }
  async update(service: Service, language: "en" | "pt"): Promise<Service> {
    const data = PrismaServiceMapper.toPrisma(service);

    const updated = await this.prisma.services.update({
      where: {
        id: data.id
      },
      data: {
        title: data.title,
        titleEn: data.titleEn,
      }
    });

    return PrismaServiceMapper.toDomain(updated, language);
  }

  async findManyByCategory(params: { categoryId: string, page: number, perPage?: number, language?: "pt" | "ne" }): Promise<Pagination<Service>> {
    const subCategories = await this.prisma.subCategory.findMany({
      where: {
        categoryId: params.categoryId
      }
    });

    const subCategoriesId = subCategories.map(item => {
      return item.id;
    });

    const subSubcategories = await this.prisma.subSubCategory.findMany({
      where: {
        subCategoryId: {
          in: subCategoriesId
        }
      },
      select: {
        id: true
      }
    });

    const ids = subSubcategories.map(item => {
      return item.id;
    });

    const services = await this.paginate({
      where: {
        subSubCategoryId: {
          in: ids
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: services.data.map(item => PrismaServiceMapper.toDomain(item, "pt")),
      meta: services.meta
    };
  }

  async findManyBySubCategory(params: ServiceManyBySubCategory): Promise<Pagination<Service>> {
    const subcategories = await this.prisma.subSubCategory.findMany({
      where: {
        subCategoryId: params.subCategoryId
      },
      select: {
        id: true
      }
    });

    const ids = subcategories.map(item => {
      return item.id;
    });

    const services = await this.paginate({
      where: {
        subSubCategoryId: {
          in: ids
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: services.data.map(item => PrismaServiceMapper.toDomain(item, params.language)),
      meta: services.meta
    };
  }

  async findMany(params: ServicePaginationParams): Promise<Pagination<Service>> {
    const services = await this.paginate({
      where: {
        subSubCategoryId: params.subSubcategoryId ? params.subSubcategoryId : {}
      },
      orderBy: {
        createdAt: "desc",
      },
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: services.data.map(item => PrismaServiceMapper.toDomain(item, params.language)),
      meta: services.meta
    };
  }

  async findById(params: ServiceFindById): Promise<Service | null> {
    const service = await this.prisma.services.findUnique({
      where: {
        id: params.id
      }
    });

    if (!service) return null;

    return PrismaServiceMapper.toDomain(service, params.language);
  }

  async create(service: Service): Promise<Service | null> {
    const data = PrismaServiceMapper.toPrisma(service);

    const result = await this.prisma.services.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        subSubCategoryId: service.parentId.toString()
      }
    });

    return PrismaServiceMapper.toDomain(result)
  }

  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.ServicesWhereInput,
    orderBy?: Prisma.ServicesOrderByWithRelationInput
    page?: number,
    perPage?: number,
    include?: Prisma.ServicesInclude
  }): Promise<PaginatorTypes.PaginatedResult<PrismaServicesItem>> {
    return paginate(
      this.prisma.services,
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