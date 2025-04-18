import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { PrismaQuotationMapper } from "../mappers/prisma-quotation-mapper";

import { QuotationsRepository } from "@/domain/work/application/repositories/quotations-repository";
import { Quotation, QuotationStatus } from "@/domain/work/enterprise/quotation";

import { PaginationParams } from "@/core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PrismaHelpersRatingAndFavoriteRepository } from "../prisma-common-helpers.service";

@Injectable()
export class PrismaQuotationsRepository implements QuotationsRepository {
  constructor(
    private prisma: PrismaService,
    private helpers: PrismaHelpersRatingAndFavoriteRepository
  ) { }

  async findManyOfServiceProvider(params: { jobId: string; serviceProviderId: string; }): Promise<Quotation[]> {
    const quotations = await this.prisma.quotation.findMany({
      where: {
        jobId: params.jobId,
        serviceProviderId: params.serviceProviderId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const result: Quotation[] = []
    for (let i = 0; i < quotations.length; i++) {
      const job = await this.prisma.job.findFirst({
        where: {
          id: quotations[i].jobId
        },
        include: {
          client: {
            include: {
              user: true
            }
          },
        }
      })

      const serviceProvider = await this.prisma.serviceProvider.findFirst({
        where: {
          id: quotations[i].serviceProviderId.toString()
        },
        include: {
          user: true
        }
      })

      const item = PrismaQuotationMapper.toDomain({
        budget: quotations[i].budget,
        clientId: job?.client.id + '',
        clientName: job?.client.firstName + ' ' + job?.client.lastName,
        clientProfileUrl: job?.client.user.profileUrl + '',
        clientRating: await this.helpers.getRating(job?.client.user.id.toString() + ''),
        cover: quotations[i].cover,
        createdAt: quotations[i].createdAt,
        date: quotations[i].date,
        id: quotations[i].id,
        isServiceProviderFavoriteOfClient: await this.helpers.isFavorite({
          clientId: job?.clientId + '',
          serviceProviderId: serviceProvider?.id.toString() + ''
        }),
        jobId: quotations[i].jobId,
        readByClient: quotations[i].status === "REJECTED",
        rejectDescription: quotations[i].rejectDescription,
        rejectReasonId: quotations[i].rejectReasonId,
        serviceProviderId: quotations[i].serviceProviderId,
        serviceProviderName: serviceProvider?.firstName + ' ' + serviceProvider?.lastName,
        serviceProviderProfileUrl: serviceProvider?.user.profileUrl + '',
        serviceProviderRating: await this.helpers.getRating(serviceProvider?.user.id.toString() + ''),
        status: quotations[i].status,
        updatedAt: quotations[i].updatedAt
      });

      result.push(item)
    }

    return result
  }

  async spHasPendingQuotation(params: { jobId: string; serviceProviderId: string; }): Promise<boolean> {
    const total = await this.prisma.quotation.count({
      where: {
        jobId: params.jobId,
        serviceProviderId: params.serviceProviderId,
        status: "PENDING"
      },
    });

    return total > 0;
  }
  async findByServiceProviderAndJob(params: { jobId: string; serviceProviderId: string; }): Promise<Quotation | null> {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        jobId: params.jobId,
        serviceProviderId: params.serviceProviderId
      },
    });

    if (!quotation) return null;

    const job = await this.prisma.job.findFirst({
      where: {
        id: quotation.jobId
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
      }
    })

    const serviceProvider = await this.prisma.serviceProvider.findFirst({
      where: {
        id: quotation.serviceProviderId.toString()
      },
      include: {
        user: true
      }
    })

    return PrismaQuotationMapper.toDomain({
      budget: quotation.budget,
      clientId: job?.client.id + '',
      clientName: job?.client.firstName + ' ' + job?.client.lastName,
      clientProfileUrl: job?.client.user.profileUrl + '',
      clientRating: await this.helpers.getRating(job?.client.user.id.toString() + ''),
      cover: quotation.cover,
      createdAt: quotation.createdAt,
      date: quotation.date,
      id: quotation.id,
      isServiceProviderFavoriteOfClient: await this.helpers.isFavorite({
        clientId: job?.clientId + '',
        serviceProviderId: serviceProvider?.id.toString() + ''
      }),
      jobId: quotation.jobId,
      readByClient: quotation.status === "REJECTED",
      rejectDescription: quotation.rejectDescription,
      rejectReasonId: quotation.rejectReasonId,
      serviceProviderId: quotation.serviceProviderId,
      serviceProviderName: serviceProvider?.firstName + ' ' + serviceProvider?.lastName,
      serviceProviderProfileUrl: serviceProvider?.user.profileUrl + '',
      serviceProviderRating: await this.helpers.getRating(serviceProvider?.user.id.toString() + ''),
      status: quotation.status,
      updatedAt: quotation.updatedAt
    });
  }

  async setAsRead(id: string): Promise<void> {
    await this.prisma.quotation.update({
      where: { id },
      data: { readByClient: true }
    });
  }

  async rejectQuotation(data: { id: string; state: QuotationStatus; description: string; reasonId: string; }): Promise<void> {
    await this.prisma.quotation.update({
      where: { id: data.id },
      data: {
        status: data.state,
        rejectDescription: data.description,
        rejectReasonId: data.reasonId
      }
    });
  }

  async updateState(quotationId: string, state: QuotationStatus): Promise<void> {
    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: { status: state }
    });
  }

  async findMany(params: PaginationParams & { taskId: string; }): Promise<Quotation[]> {
    const page = params.page;

    const quotations = await this.prisma.quotation.findMany({
      orderBy: { createdAt: "desc", },
      take: 20,
      skip: (page - 1) * 20
    });

    let result: Quotation[] = []
    for (const element of quotations) {
      const job = await this.prisma.job.findFirst({
        where: {
          id: element.jobId
        },
        include: {
          client: {
            include: {
              user: true
            }
          },
        }
      })

      const serviceProvider = await this.prisma.serviceProvider.findFirst({
        where: {
          id: element.serviceProviderId.toString()
        },
        include: {
          user: true
        }
      })

      let quot = Quotation.create({
        budget: element.budget.toNumber(),
        clientId: job?.client.id,
        clientName: job?.client.firstName + ' ' + job?.client.lastName,
        clientProfileUrl: job?.client.user.profileUrl,
        clientRating: await this.helpers.getRating(job?.client.user.id.toString() + ''),
        cover: element.cover,
        createdAt: element.createdAt,
        date: element.date,
        id: new UniqueEntityID(element.id),
        isServiceProviderFavoriteOfClient: await this.helpers.isFavorite({
          clientId: job?.clientId + '',
          serviceProviderId: serviceProvider?.id.toString() + ''
        }),
        jobId: new UniqueEntityID(element.jobId),
        readByClient: element.status === "REJECTED",
        rejectDescription: element.rejectDescription,
        rejectReasonId: element.rejectReasonId,
        serviceProviderId: new UniqueEntityID(element.serviceProviderId),
        serviceProviderName: serviceProvider?.firstName + ' ' + serviceProvider?.lastName,
        serviceProviderProfileUrl: serviceProvider?.user.profileUrl,
        serviceProviderRating: await this.helpers.getRating(serviceProvider?.user.id.toString() + ''),
        updatedAt: element.updatedAt,
        state: element.status
      })

      result.push(quot)
    }


    return result
  }

  async findById(id: string): Promise<Quotation | null> {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) return null

    const job = await this.prisma.job.findFirst({
      where: {
        id: quotation.jobId
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
      }
    })

    const serviceProvider = await this.prisma.serviceProvider.findFirst({
      where: {
        id: quotation.serviceProviderId.toString()
      },
      include: {
        user: true
      }
    })

    return quotation ? PrismaQuotationMapper.toDomain({
      budget: quotation.budget,
      clientId: job?.client.id + '',
      clientName: job?.client.firstName + ' ' + job?.client.lastName,
      clientProfileUrl: job?.client.user.profileUrl + '',
      clientRating: await this.helpers.getRating(job?.client.user.id.toString() + ''),
      cover: quotation.cover,
      createdAt: quotation.createdAt,
      date: quotation.date,
      id: quotation.id,
      isServiceProviderFavoriteOfClient: await this.helpers.isFavorite({
        clientId: job?.clientId + '',
        serviceProviderId: serviceProvider?.id.toString() + ''
      }),
      jobId: quotation.jobId,
      readByClient: quotation.status === "REJECTED",
      rejectDescription: quotation.rejectDescription,
      rejectReasonId: quotation.rejectReasonId,
      serviceProviderId: quotation.serviceProviderId,
      serviceProviderName: serviceProvider?.firstName + ' ' + serviceProvider?.lastName,
      serviceProviderProfileUrl: serviceProvider?.user.profileUrl + '',
      serviceProviderRating: await this.helpers.getRating(serviceProvider?.user.id.toString() + ''),
      status: quotation.status,
      updatedAt: quotation.updatedAt
    }) : null;
  }

  async create(quotation: Quotation): Promise<Quotation> {
    const data = PrismaQuotationMapper.toPrisma(quotation);

    const response = await this.prisma.quotation.create({
      data: {
        budget: data.budget,
        cover: data.cover,
        date: data.date,
        status: data.status,
        jobId: data.jobId,
        serviceProviderId: data.serviceProviderId,
        readByClient: false
      }
    });

    const job = await this.prisma.job.findFirst({
      where: {
        id: response.jobId
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
      }
    })

    const serviceProvider = await this.prisma.serviceProvider.findFirst({
      where: {
        id: response.serviceProviderId.toString()
      },
      include: {
        user: true
      }
    })

    return PrismaQuotationMapper.toDomain({
      budget: response.budget,
      clientId: job?.client.id + '',
      clientName: job?.client.firstName + ' ' + job?.client.lastName,
      clientProfileUrl: job?.client.user.profileUrl + '',
      clientRating: await this.helpers.getRating(job?.client.user.id.toString() + ''),
      cover: response.cover,
      createdAt: response.createdAt,
      date: response.date,
      id: response.id,
      isServiceProviderFavoriteOfClient: await this.helpers.isFavorite({
        clientId: job?.clientId + '',
        serviceProviderId: serviceProvider?.id.toString() + ''
      }),
      jobId: response.jobId,
      readByClient: response.status === "REJECTED",
      rejectDescription: response.rejectDescription,
      rejectReasonId: response.rejectReasonId,
      serviceProviderId: response.serviceProviderId,
      serviceProviderName: serviceProvider?.firstName + ' ' + serviceProvider?.lastName,
      serviceProviderProfileUrl: serviceProvider?.user.profileUrl + '',
      serviceProviderRating: await this.helpers.getRating(serviceProvider?.user.id.toString() + ''),
      status: response.status,
      updatedAt: response.updatedAt
    });
  }

}