import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { ClientServiceProviderFavoriteRepository } from "@/domain/users/application/repositories/client-service-provider-favorite";
import { ServiceProvider } from "@/domain/users/enterprise/service-provider";
import { PrismaServiceProviderMapper } from "../mappers/prisma-service-provider-mapper";
import { Prisma, ClientServiceProviderFavorite as PrismaClientServiceProviderFavorite } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Pagination } from "@/core/repositories/pagination-params";
import { PrismaHelpersRatingAndFavoriteRepository } from "../prisma-common-helpers.service";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaClientServiceProviderFavoritesRepository implements ClientServiceProviderFavoriteRepository {
  constructor(
    private prisma: PrismaService,
    private helpers: PrismaHelpersRatingAndFavoriteRepository
  ) { }

  async isFavorite(params: { clientId: string; serviceProviderId: string; }): Promise<boolean> {
    return this.helpers.isFavorite(params)
  }

  async findMany(params: { clientId: string, page: number, perPage?: number }): Promise<Pagination<ServiceProvider>> {
    const favorites = await this.paginate({
      where: {
        clientId: params.clientId
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        serviceProvider: {
          include: {
            user: true
          }
        }
      },
      page: params.page,
      perPage: params.perPage
    });

    const result: ServiceProvider[] = [];
    for (const element of favorites.data) {
      const item = element;

      const spData = await this.prisma.serviceProvider.findUnique({
        where: {
          id: item.serviceProviderId
        },
        include: {
          user: true,
        }
      });

      if (!spData) continue;

      const rating = await this.helpers.getRating(spData.userId);

      const subscription = await this.prisma.subscription.findFirst({
        where: {
          serviceProviderId: spData.id.toString(),
          status: "ACTIVE"
        }
      });

      const toAdd = PrismaServiceProviderMapper.toDomain({
        bornAt: spData.bornAt,
        createdAt: spData.createdAt,
        description: spData.description,
        education: spData.education,
        isFavorite: false,
        user: {
          email: spData.user.email,
          isEmailValidated: spData.user.isEmailValidated,
          isPhoneNumberValidated: spData.user.isPhoneNumberValidated,
          phoneNumber: spData.user.phoneNumber,
          profileUrl: spData.user.profileUrl,
          rating,
          state: spData.user.state,
        },
        firstName: spData.firstName,
        gender: spData.gender,
        hasBudget: spData.hasBudget,
        hasCertificateByBulir: spData.hasCertificateByBulir,
        id: spData.id,
        isApproved: spData.isApproved,
        lastName: spData.lastName,
        updatedAt: spData.updatedAt,
        userId: spData.userId,
        subscriptionId: `${subscription?.id}`,
        specializations: []
      });

      result.push(toAdd);
    }

    return {
      data: result,
      meta: favorites.meta
    };
  }
  async createOrDelete(clientId: string, serviceProviderId: string): Promise<void> {
    const totalFavorite = await this.prisma.clientServiceProviderFavorite.count({
      where: {
        clientId,
        serviceProviderId
      }
    });

    if (totalFavorite > 0) {
      await this.prisma.clientServiceProviderFavorite.deleteMany({
        where: {
          clientId,
          serviceProviderId
        }
      });

      return;
    }

    await this.prisma.clientServiceProviderFavorite.create({
      data: {
        clientId,
        serviceProviderId
      }
    });
  }

  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.ClientServiceProviderFavoriteWhereInput,
    orderBy?: Prisma.ClientServiceProviderFavoriteOrderByWithRelationInput,
    include?: Prisma.ClientServiceProviderFavoriteInclude,
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaClientServiceProviderFavorite>> {
    return paginate(
      this.prisma.clientServiceProviderFavorite,
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