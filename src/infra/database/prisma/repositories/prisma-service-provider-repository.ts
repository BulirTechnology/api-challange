
import { EducationLevel, Prisma } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Injectable } from "@nestjs/common";

import { ServiceProvidersRepository } from "@/domain/users/application/repositories/service-provider-repository";
import { ServiceProvider } from "@/domain/users/enterprise/service-provider";
import { Skill } from "@/domain/users/enterprise/skill";

import { PrismaService } from "../prisma.service";
import {
  PrismaServiceProviderMapper,
  PrismaServiceProviderMapperType
} from "../mappers/prisma-service-provider-mapper";
import { PrismaSkillMapper } from "../mappers/prisma-skill-mapper";

import { Pagination } from "@/core/repositories/pagination-params";
import { PrismaHelpersRatingAndFavoriteRepository } from "../prisma-common-helpers.service";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaServiceProvidersRepository implements ServiceProvidersRepository {
  constructor(
    private prisma: PrismaService,
    private helpers: PrismaHelpersRatingAndFavoriteRepository
  ) { }

  async setJobAsViewed(params: { id: string; jobId: string; }): Promise<void> {
    await this.prisma.serviceProviderJobViews.create({
      data: {
        jobId: params.jobId,
        serviceProviderId: params.id
      }
    });
  }

  async countJobNotViewed(id: string): Promise<number> {
    const viewedJobIds = await this.prisma.serviceProviderJobViews.findMany({
      where: { serviceProviderId: id, },
      select: { jobId: true, },
    });

    const viewedIds = viewedJobIds.map((view) => view.jobId);

    return await this.prisma.job.count({
      where: {
        NOT: {
          id: {
            in: viewedIds,
          },
        },
      },
    });
  }

  async findMany(params: { page: number; name?: string | undefined; perPage: number }): Promise<Pagination<ServiceProvider>> {
    const paginateResult = await this.paginate({
      where: {
        OR: params.name ? [
          {
            firstName: {
              contains: params.name,
               mode: 'insensitive'
            },
          },
          {
            lastName: {
              contains: params.name,
               mode: 'insensitive'
            }
          }
        ] : []
      },
      include: {
        user: true
      }
    });

    const result: ServiceProvider[] = [];
    for (const serviceProvider of paginateResult.data) {
      const rating = await this.helpers.getRating(serviceProvider.userId);

      const subscription = await this.prisma.subscription.findFirst({
        where: {
          serviceProviderId: serviceProvider.id.toString(),
          status: "ACTIVE"
        }
      });

      const sp = PrismaServiceProviderMapper.toDomain({
        bornAt: serviceProvider.bornAt,
        createdAt: serviceProvider.createdAt,
        firstName: serviceProvider.firstName,
        gender: serviceProvider.gender,
        id: serviceProvider.id,
        lastName: serviceProvider.lastName,
        updatedAt: serviceProvider.updatedAt,
        userId: serviceProvider.userId,
        description: serviceProvider.description,
        education: serviceProvider.description as EducationLevel,
        isApproved: serviceProvider.isApproved,
        isFavorite: false,
        user: {
          state: serviceProvider.user.state,
          isEmailValidated: serviceProvider.user.isEmailValidated,
          isPhoneNumberValidated: serviceProvider.user.isPhoneNumberValidated,
          email: serviceProvider.user.email,
          phoneNumber: serviceProvider.user.phoneNumber,
          profileUrl: serviceProvider.user.profileUrl,
          rating,
        },
        hasBudget: serviceProvider.hasBudget,
        hasCertificateByBulir: serviceProvider.hasCertificateByBulir,
        subscriptionId: subscription?.id.toString() + "",
        specializations: []
      });

      result.push(sp);
    }

    return {
      data: result,
      meta: paginateResult.meta
    };
  }

  async findOfService(params: {
    page: number;
    serviceId: string;
    perPage: number;
    clientId?: string
  }): Promise<Pagination<ServiceProvider>> {
    const resultPaginate = await this.paginate({
      where: {
        specializations: {
          some: {
            serviceId: params.serviceId
          }
        }
      },
      include: {
        user: true,
        specializations: {
          where: {
            serviceId: params.serviceId
          }
        }
      },
    });

    const result: ServiceProvider[] = [];
    for (const element of resultPaginate.data) {
      const item = element;

      if (item.specializations.length <= 0) continue;

      const subscription = await this.prisma.subscription.findFirst({
        where: {
          serviceProviderId: element.id.toString(),
          status: "ACTIVE"
        }
      });

      const rating = await this.helpers.getRating(item.userId);

      const data = PrismaServiceProviderMapper.toDomain({
        bornAt: item.bornAt,
        createdAt: item.createdAt,
        description: item.description,
        education: item.education,
        user: {
          email: item.user.email,
          isEmailValidated: item.user.isEmailValidated,
          isPhoneNumberValidated: item.user.isPhoneNumberValidated,
          profileUrl: item.user.profileUrl,
          rating,
          state: item.user.state,
          phoneNumber: item.user.phoneNumber
        },
        isFavorite: params.clientId ?
          await this.helpers.isFavorite({
            clientId: params.clientId,
            serviceProviderId: item.id
          }) : false,
        firstName: item.firstName,
        gender: item.gender,
        id: item.id,
        isApproved: item.isApproved,
        lastName: item.lastName,
        updatedAt: item.updatedAt,
        userId: item.userId,
        hasBudget: item.hasBudget,
        hasCertificateByBulir: item.hasCertificateByBulir,
        subscriptionId: `${subscription?.id}`,
        specializations: []
      });

      result.push(data);
    }

    return {
      data: result,
      meta: resultPaginate.meta
    };
  }

  async findSkill(params: { skill: string; serviceProviderId: string; }): Promise<Skill | null> {
    const skill = await this.prisma.skill.findFirst({
      where: {
        name: params.skill
      }
    });

    if (!skill) return null;

    const serviceProviderSkill = await this.prisma.skillServiceProvider.findFirst({
      where: {
        skillId: skill.id,
        serviceProviderId: params.serviceProviderId
      }
    });

    if (!serviceProviderSkill) return null;

    return PrismaSkillMapper.toDomain(skill);
  }

  async createSkill(params: { serviceProviderId: string; skill: Skill; }): Promise<Skill> {
    let skill = await this.prisma.skill.findFirst({
      where: {
        name: params.skill.name
      }
    });

    if (!skill) {
      skill = await this.prisma.skill.create({
        data: {
          name: params.skill.name
        }
      });
    }

    await this.prisma.skillServiceProvider.create({
      data: {
        serviceProviderId: params.serviceProviderId,
        skillId: skill.id
      }
    });

    return PrismaSkillMapper.toDomain(skill);
  }

  async update(provider: ServiceProvider): Promise<void> {
    const data = PrismaServiceProviderMapper.toPrisma(provider);

    await this.prisma.serviceProvider.update({
      where: {
        id: data.id
      },
      data: {
        description: data.description,
        education: data.education,
        bornAt: new Date(data.bornAt),
        firstName: data.firstName,
        gender: data.gender,
        lastName: data.lastName,
      }
    });
  }

  async findById(id: string): Promise<ServiceProvider | null> {
    const serviceProvider = await this.prisma.serviceProvider.findUnique({
      where: {
        id
      },
      include: {
        user: true
      }
    });

    if (!serviceProvider) {
      return null;
    }

    const rating = await this.helpers.getRating(serviceProvider.userId);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        serviceProviderId: serviceProvider.id.toString(),
        status: "ACTIVE"
      }
    });

    return PrismaServiceProviderMapper.toDomain({
      bornAt: serviceProvider.bornAt,
      createdAt: serviceProvider.createdAt,
      firstName: serviceProvider.firstName,
      gender: serviceProvider.gender,
      id: serviceProvider.id,
      lastName: serviceProvider.lastName,
      updatedAt: serviceProvider.updatedAt,
      userId: serviceProvider.userId,
      description: serviceProvider.description,
      education: serviceProvider.description as EducationLevel,
      isApproved: serviceProvider.isApproved,
      isFavorite: false,
      user: {
        email: serviceProvider.user.email,
        isEmailValidated: serviceProvider.user.isEmailValidated,
        isPhoneNumberValidated: serviceProvider.user.isPhoneNumberValidated,
        phoneNumber: serviceProvider.user.phoneNumber,
        profileUrl: serviceProvider.user.profileUrl,
        rating,
        state: serviceProvider.user.state
      },
      hasBudget: serviceProvider.hasBudget,
      hasCertificateByBulir: serviceProvider.hasCertificateByBulir,
      subscriptionId: `${subscription?.id}`,
      specializations: []
    });
  }

  async create(serviceProvider: ServiceProvider): Promise<ServiceProvider> {
    const data = PrismaServiceProviderMapper.toPrisma(serviceProvider);

    const result = await this.prisma.serviceProvider.create({
      data: {
        bornAt: new Date(data.bornAt),
        firstName: data.firstName,
        gender: data.gender,
        lastName: data.lastName,
        userId: data.userId,
        education: data.education,
        description: data.description,
        subscriptionId: ""
      },
      include: {
        user: true
      }
    });

    return PrismaServiceProviderMapper.toDomain({
      bornAt: result.bornAt,
      createdAt: result.createdAt,
      description: result.description,
      education: result.education,
      isFavorite: false,
      user: {
        email: result.user.email,
        isEmailValidated: result.user.isEmailValidated,
        isPhoneNumberValidated: result.user.isPhoneNumberValidated,
        phoneNumber: result.user.phoneNumber,
        state: result.user.state,
        profileUrl: result.user.profileUrl,
        rating: 0,
      },
      firstName: result.firstName,
      gender: result.gender,
      id: result.id,
      isApproved: result.isApproved,
      lastName: result.lastName,
      updatedAt: result.updatedAt,
      userId: result.userId,
      hasBudget: result.hasBudget,
      hasCertificateByBulir: result.hasCertificateByBulir,
      subscriptionId: "",
      specializations: []
    });
  }

  async findByEmail(email: string): Promise<ServiceProvider | null> {
    const serviceProvider = await this.prisma.serviceProvider.findFirst({
      where: {
        user: {
          email
        }
      },
      include: {
        user: true
      }
    });

    if (!serviceProvider) {
      return null;
    }
    const rating = await this.helpers.getRating(serviceProvider.userId);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        serviceProviderId: serviceProvider.id.toString(),
        status: "ACTIVE"
      }
    });

    return PrismaServiceProviderMapper.toDomain({
      bornAt: serviceProvider.bornAt,
      createdAt: serviceProvider.createdAt,
      firstName: serviceProvider.firstName,
      gender: serviceProvider.gender,
      id: serviceProvider.id,
      lastName: serviceProvider.lastName,
      updatedAt: serviceProvider.updatedAt,
      userId: serviceProvider.userId,
      description: serviceProvider.description,
      education: serviceProvider.education,
      isApproved: serviceProvider.isApproved,
      isFavorite: false,
      user: {
        email: serviceProvider.user.email,
        isEmailValidated: serviceProvider.user.isEmailValidated,
        isPhoneNumberValidated: serviceProvider.user.isPhoneNumberValidated,
        phoneNumber: serviceProvider.user.phoneNumber,
        profileUrl: serviceProvider.user.profileUrl,
        rating,
        state: serviceProvider.user.state
      },
      hasBudget: serviceProvider.hasBudget,
      hasCertificateByBulir: serviceProvider.hasCertificateByBulir,
      subscriptionId: `${subscription?.id}`,
      specializations: []
    });
  }

  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.ServiceProviderWhereInput,
    orderBy?: Prisma.ServiceProviderOrderByWithRelationInput
    include?: Prisma.ServiceProviderInclude
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaServiceProviderMapperType>> {
    return paginate(
      this.prisma.serviceProvider,
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