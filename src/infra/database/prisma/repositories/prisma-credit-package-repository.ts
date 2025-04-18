import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma, CreditPackage as PrismaCreditPackage } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { CreditPackageRepository } from "@/domain/subscriptions/applications/repositories/credit-package-repository";
import { Pagination } from "@/core/repositories/pagination-params";
import { CreditPackageStatus, CreditPackage } from "@/domain/subscriptions/enterprise/credit-package";
import { PrismaCreditPackageMapper } from "../mappers/prisma-credit-package-mapper";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaCreditPackageRepository implements CreditPackageRepository {
  constructor(private prisma: PrismaService) { }

  async findByName(name: string): Promise<CreditPackage | null> {
    const data = await this.prisma.creditPackage.findFirst({
      where: {
        name
      }
    })

    if (!data) return null

    return PrismaCreditPackageMapper.toDomain(data)
  }

  async findMany(params: { page: number; perPage: number; status: CreditPackageStatus | "ALL"; }): Promise<Pagination<CreditPackage>> {
    const d = await this.paginate({
      where: {

      },
      page: params.page,
      perPage: params.perPage
    });

    return {
      data: d.data.map(item => PrismaCreditPackageMapper.toDomain(item)),
      meta: d.meta
    };
  }
  async create(pack: CreditPackage): Promise<CreditPackage> {
    const packagePrisma = PrismaCreditPackageMapper.toPrisma(pack);

    const d = await this.prisma.creditPackage.create({
      data: packagePrisma
    });

    return PrismaCreditPackageMapper.toDomain(d);
  }

  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.CreditPackageWhereInput,
    orderBy?: Prisma.CreditPackageOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaCreditPackage>> {
    return paginate(
      this.prisma.creditPackage,
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