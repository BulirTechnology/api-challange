
import { Injectable } from "@nestjs/common";
import {
  Prisma, Job as PrismaJob,
  Address,
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

import {
  Job,
  JobState,
  QuotationState
} from "@/domain/work/enterprise/job";
import { JobPaginationParams } from "@/domain/work/application/params/job-params";
import { JobsRepository } from "@/domain/work/application/repositories/job-repository";
import { QuotationStatus } from "@/domain/work/enterprise/quotation";
import { Pagination } from "@/core/repositories/pagination-params";

import { PrismaService } from "../prisma.service";
import { PrismaJobMapper } from "../mappers/prisma-job-mapper";
import { PrismaHelpersRatingAndFavoriteRepository } from "../prisma-common-helpers.service";
import { AccountType } from "@/domain/users/enterprise/user";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

type JobProp = PrismaJob & {
  address: Address
}

function calculateDistance(lat1: any, lon1: any, lat2: any, lon2: any): number {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em quilômetros
  return distance;
}

// Função auxiliar para converter graus em radianos
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

@Injectable()
export class PrismaJobsRepository implements JobsRepository {
  constructor(
    private prisma: PrismaService,
    private helpers: PrismaHelpersRatingAndFavoriteRepository
  ) { }

  private buildOrderBy(params: JobPaginationParams): Prisma.JobOrderByWithRelationInput[] {
    const orderBy: Prisma.JobOrderByWithRelationInput[] = [{ createdAt: "desc" }];

    if (params.priceSort) {
      orderBy.push({
        price: params.priceSort === "HighToLow" ? "asc" : "desc"
      });
    }

    return orderBy;
  }
  private buildJobWhereClause(params: JobPaginationParams): Prisma.JobWhereInput {
    const stateWhere: ("BOOKED" | "CLOSED" | "OPEN")[] = [];
    if (params.statusClosed) stateWhere.push("CLOSED");
    if (params.statusOpen) stateWhere.push("OPEN");
    if (params.statusBooked) stateWhere.push("BOOKED");

    const viewStateWhere: ("PRIVATE" | "PUBLIC")[] = [];
    if (params.viewStatePrivate) viewStateWhere.push("PRIVATE");
    if (params.viewStatePublic) viewStateWhere.push("PUBLIC");

    const resultPostedDate = params.postedDate ? {
      gte: new Date(new Date(params.postedDate).setHours(0, 0, 0, 0)),
    } : {};

    const resultStartDate = params.expectedDate ? {
      lte: new Date(new Date(params.expectedDate).setHours(23, 59, 59, 999))
    } : {};

    return {
      clientId: { endsWith: params.clientId },
      title: params.title ? { contains: params.title } : undefined,
      viewState: { in: viewStateWhere.length ? viewStateWhere : undefined },
      state: { in: stateWhere.length ? stateWhere : undefined, not: "BOOKED" },
      createdAt: {
        ...resultPostedDate,
        ...resultStartDate
      }
    };
  }
  private async getAnswersResult(jobId: string): Promise<{ question: string, answer: string[], answerId: string[], questionId: string }[]> {
    const answers = await this.prisma.answerJob.findMany({
      where: { jobId },
      include: { question: true }
    });

    const answersResult: { question: string, answer: string[], answerId: string[], questionId: string }[] = [];

    for (const ans of answers) {
      let exist = false;

      for (const ansResult of answersResult) {
        if (ansResult.questionId === ans.questionId) {
          ansResult.answerId.push(ans.value);
          ansResult.answer.push(ans.value);
          exist = true;
        }
      }

      if (!exist) {
        const question = await this.prisma.question.findFirst({ where: { id: ans.questionId } });
        const option = await this.prisma.option.findFirst({ where: { questionId: ans.questionId } });

        answersResult.push({
          answer: [question && question.type !== "SIMPLE" && option ? option.value : ans.value],
          answerId: [ans.value],
          question: ans.question.title,
          questionId: ans.questionId
        });
      }
    }

    return answersResult;
  }
  private async getServiceDetails(serviceId: string) {
    const service = await this.prisma.services.findFirst({ where: { id: serviceId } });
    const subSubCategory = service ? await this.prisma.subSubCategory.findFirst({ where: { id: service.subSubCategoryId } }) : null;
    const subCategory = subSubCategory ? await this.prisma.subCategory.findFirst({ where: { id: subSubCategory.subCategoryId } }) : null;
    const category = subCategory ? await this.prisma.category.findFirst({ where: { id: subCategory.categoryId } }) : null;

    return { service, category, subCategory, subSubCategory };
  }
  private async getQuotationsResult(job: JobProp, accountType: "Client" | "ServiceProvider" | "SuperAdmin", serviceProviderId?: string): Promise<{
    id: string;
    serviceProviderName: string;
    serviceProviderId: string;
    profileUrl: string;
    rating: number;
    budget: number;
    status: QuotationStatus;
    date: Date;
    readByClient: boolean;
    createdAt: Date;
    description: string;
    serviceProviderIsFavorite: boolean;
  }[]> {
    const lastQuotations = await this.prisma.quotation.groupBy({
      by: ['serviceProviderId'],
      _max: {
        createdAt: true,
      },
      where: {
        jobId: job.id,
      },
      orderBy: {
        _max: {
          createdAt: 'desc'
        }
      }
    });

    const quotations =
      accountType === "ServiceProvider" ?
        await this.prisma.quotation.findMany({
          where: {
            jobId: job.id,
            serviceProviderId
          },
          include: {
            serviceProvider: {
              include: { user: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }) :
        await Promise.all(
          lastQuotations.map(async q => {
            const quotations = await this.prisma.quotation.findMany({
              where: {
                serviceProviderId: q.serviceProviderId,
                createdAt: q._max.createdAt as string | Date,
                jobId: job.id
              },
              include: {
                serviceProvider: {
                  include: { user: true }
                }
              },
              orderBy: { createdAt: "desc" }
            });

            return quotations[0];
          })
        )

    return await Promise.all(quotations.map(async (element) => {
      const rating = await this.helpers.getRating(element.serviceProviderId);

      return {
        rating,
        readByClient: element.readByClient,
        budget: element.budget.toNumber(),
        createdAt: element.createdAt,
        description: element.cover,
        id: element.id,
        date: element.date,
        profileUrl: element.serviceProvider.user.profileUrl,
        serviceProviderId: element.serviceProviderId,
        serviceProviderName: `${element.serviceProvider.firstName} ${element.serviceProvider.lastName}`,
        status: element.status,
        serviceProviderIsFavorite: await this.helpers.isFavorite({
          serviceProviderId: element.serviceProviderId,
          clientId: `${job.clientId}`
        })
      };
    }));
  }
  private formatAddress(address: Address) {
    return {
      name: address.name,
      latitude: address.latitude.toNumber(),
      line1: address.line1,
      line2: address.line2,
      longitude: address.longitude.toNumber()
    };
  }
  private defaultAddress() {
    return {
      name: "",
      latitude: 0,
      line1: "",
      line2: "",
      longitude: 0
    };
  }
  private async updateJobField(jobId: string, data: Prisma.JobUpdateInput): Promise<void> {
    await this.prisma.job.update({
      where: { id: jobId },
      data
    });
  }

  async countUnreadedQuotations(params: { clientId: string }): Promise<number> {
    const totalNewQuotations = await this.prisma.quotation.count({
      where: {
        readByClient: false,
        status: 'PENDING',
        job: {
          clientId: params.clientId
        }
      },
    });

    return totalNewQuotations;
  }
  async findNearJobsProvider(params: JobPaginationParams): Promise<any> {
    const latitude = params.address.latitude, longitude = params.address.longitude;

    const radius = 15

    const orderBy = this.buildOrderBy(params);
    const jobWhereClause = this.buildJobWhereClause(params);

    const listJobs = await this.paginate({
      where: {
        ...jobWhereClause,
        address: {
          latitude: {
            lte: latitude + radius / 111,
            gte: latitude - radius / 111
          },
          longitude: {
            lte: longitude + radius / (111 * Math.cos(latitude)),
            gte: longitude - radius / (111 * Math.cos(latitude))
          }
        }
      },
      orderBy,
      page: params.page,
      perPage: params.perPage,
      include: { address: true }
    });

    const jobsWithinRadius = listJobs.data.filter(job => {
      const jobDistance = calculateDistance(latitude, longitude, job.address.latitude, job.address.longitude);

      return jobDistance <= radius;
    });

    const result: Job[] = await Promise.all(jobsWithinRadius.map(async (job) => {
      const answersResult = await this.getAnswersResult(job.id);
      const { service, category, subCategory, subSubCategory } = await this.getServiceDetails(job.serviceId);
      const quotationsResult = await this.getQuotationsResult(job, params.accountType);

      return PrismaJobMapper.toDomain({
        ...job,
        answers: answersResult,
        quotations: quotationsResult,
        address: job.address ? this.formatAddress(job.address) : this.defaultAddress(),
        service: service ? { id: service.id, title: service.title } : undefined,
        category: category ? { id: category.id, title: category.title } : undefined,
        subCategory: subCategory ? { id: subCategory.id, title: subCategory.title } : undefined,
        subSubCategory: subSubCategory ? { id: subSubCategory.id, title: subSubCategory.title } : undefined
      });
    }));

    return {
      data: result,
      meta: listJobs.meta
    };
  }

  async findMany(params: JobPaginationParams): Promise<Pagination<Job>> {
    const orderBy = this.buildOrderBy(params);
    const jobWhereClause = this.buildJobWhereClause(params);

    const listJobs = await this.paginate({
      where: jobWhereClause,
      orderBy,
      page: params.page,
      perPage: params.perPage,
      include: { address: true }
    });

    const result: Job[] = await Promise.all(listJobs.data.map(async (job) => {
      const answersResult = await this.getAnswersResult(job.id);
      const { service, category, subCategory, subSubCategory } = await this.getServiceDetails(job.serviceId);
      const quotationsResult = await this.getQuotationsResult(job, params.accountType, params.serviceProviderId);

      return PrismaJobMapper.toDomain({
        ...job,

        answers: answersResult,
        quotations: quotationsResult,
        address: job.address ? this.formatAddress(job.address) : this.defaultAddress(),
        service: service ? { id: service.id, title: service.title } : undefined,
        category: category ? { id: category.id, title: category.title } : undefined,
        subCategory: subCategory ? { id: subCategory.id, title: subCategory.title } : undefined,
        subSubCategory: subSubCategory ? { id: subSubCategory.id, title: subSubCategory.title } : undefined
      });
    }));

    return {
      data: result,
      meta: listJobs.meta
    };
  }

  async findById(params: {
    id: string
    accountType: AccountType,
    userId: string
  }): Promise<Job | null> {
    const job = await this.prisma.job.findUnique({
      where: { id: params.id },
      include: { address: true }
    });

    if (!job) return null;

    const answersResult = await this.getAnswersResult(job.id);
    const { service, category, subCategory, subSubCategory } = await this.getServiceDetails(job.serviceId);
    const quotationsR = await this.getQuotationsResult(job, params.accountType);

    return PrismaJobMapper.toDomain({
      ...job,
      answers: answersResult,
      quotations: quotationsR,
      address: job.address ? this.formatAddress(job.address) : this.defaultAddress(),
      service: service ? { id: service.id, title: service.title } : undefined,
      category: category ? { id: category.id, title: category.title } : undefined,
      subCategory: subCategory ? { id: subCategory.id, title: subCategory.title } : undefined,
      subSubCategory: subSubCategory ? { id: subSubCategory.id, title: subSubCategory.title } : undefined
    });
  }

  async updateQuotationState(jobId: string, state: QuotationState): Promise<void> {
    await this.updateJobField(jobId, { quotationState: state });
  }
  async updateState(jobId: string, state: JobState): Promise<void> {
    await this.updateJobField(jobId, { state });
  }
  async updateStartDate(jobId: string, startDate: Date): Promise<void> {
    await this.updateJobField(jobId, { startDate });
  }
  async updateAddress(jobId: string, addressId: string) {
    await this.prisma.job.update({
      where: { id: jobId },
      data: { addressId }
    });
  }
  async updateService(jobId: string, serviceId: string): Promise<void> {
    await this.prisma.job.update({
      where: { id: jobId },
      data: { serviceId }
    });
  }
  async updateImage(params: { jobId: string, url: string, field: string }): Promise<void> {
    await this.updateJobField(params.jobId, { [params.field]: params.url, });
  }
  async cancelJob(data: { id: string; state: JobState; description: string; reasonId: string; }): Promise<void> {
    await this.updateJobField(data.id, {
      state: data.state,
      cancelDescription: data.description,
      cancelReasonId: data.reasonId
    });
  }

  async create(job: Job): Promise<Job> {
    const data = PrismaJobMapper.toPrisma(job);

    const jobCreated = await this.prisma.job.create({
      data: {
        description: data.description,
        price: data.price,
        serviceId: data.serviceId,
        startDate: data.startDate,
        title: data.title,
        clientId: data.clientId,
        state: "OPEN",
        addressId: data.addressId,
        image1: data.image1,
        image2: data.image2,
        image3: data.image3,
        image4: data.image4,
        image5: data.image5,
        image6: data.image6,
        quotationState: data.quotationState,
        viewState: data.viewState
      }
    });

    return PrismaJobMapper.toDomain({
      addressId: job.addressId.toString(),
      clientId: job.clientId.toString(),
      createdAt: job.createdAt,
      description: job.description,
      id: jobCreated.id.toString(),
      image1: job.image1,
      image2: job.image2,
      image3: job.image3,
      image4: job.image4,
      image5: job.image5,
      image6: job.image6,
      price: jobCreated.price,
      quotationState: job.quotationState,
      serviceId: job.serviceId.toString(),
      startDate: job.startDate,
      state: job.state,
      title: job.title,
      viewState: job.viewState,
      answers: [],
      quotations: [],
      updatedAt: new Date(),
      address: this.defaultAddress(),
      cancelDescription: "",
      cancelReasonId: "",
      service: undefined,
      category: undefined,
      subCategory: undefined,
      subSubCategory: undefined,
    });
  }

  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.JobWhereInput,
    orderBy?: Prisma.JobOrderByWithRelationInput | Prisma.JobOrderByWithRelationInput[],
    page?: number,
    perPage?: number,
    include?: Prisma.JobInclude
  }): Promise<PaginatorTypes.PaginatedResult<JobProp>> {
    return paginate(
      this.prisma.job,
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