import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { JobsRepository } from "../../repositories";
import { JobProps } from "@/domain/work/enterprise";
import {
  ClientsRepository,
  UsersRepository
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
interface FetchClientJobsUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage: number
  userId: string
  statusOpen: boolean
  statusBooked: boolean
  statusClosed: boolean
  categoryId: string
  postedDate: string
  expectedDate: string
  viewStatePrivate: boolean
  viewStatePublic: boolean
  title: string
}

export type ClientJobType = JobProps & { newQuotations: number, id: UniqueEntityID }

type FetchClientJobsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    jobs: ClientJobType[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientJobsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private jobsRepository: JobsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    page,
    categoryId,
    expectedDate,
    postedDate,
    statusBooked,
    statusClosed,
    statusOpen,
    viewStatePrivate,
    viewStatePublic,
    userId,
    title,
    perPage
  }: FetchClientJobsUseCaseRequest): Promise<FetchClientJobsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const jobs = await this.jobsRepository.findMany({
      page,
      categoryId,
      expectedDate,
      postedDate,
      clientId: client.id.toString(),
      title,
      statusBooked,
      statusClosed,
      statusOpen,
      viewStatePrivate,
      viewStatePublic,
      perPage,
      address: {
        latitude: 0,
        longitude: 0
      },
      accountType: "Client",
      userId
    });

    const result: ClientJobType[] = [];

    for (const element of jobs.data) {
      const newQuotations = await this.clientRepository.findNewQuotations({
        clientId: client.id.toString(),
        jobId: element.id.toString()
      });

      result.push({
        ...element,
        newQuotations,
        title: element.title,
        description: element.description,
        viewState: element.viewState,
        answers: element.answers,
        quotations: element.quotations,
        price: element.price,
        clientId: element.clientId,
        addressId: element.addressId,
        serviceId: element.serviceId,
        quotationState: element.quotationState,
        state: element.state,
        image1: element.image1,
        image2: element.image2,
        image3: element.image3,
        image4: element.image4,
        image5: element.image5,
        image6: element.image6,
        address: element.address,
        startDate: element.startDate,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
        category: element.category,
        categoryId: element.categoryId,
        subCategory: element.subCategory,
        subCategoryId: element.subCategoryId,
        subSubCategory: element.subSubCategory,
        subSubCategoryId: element.subSubCategoryId,
        service: element.service,
        cancelDescription: element.cancelDescription,
        cancelReasonId: element.cancelReasonId,
        id: element.id,
      });
    }

    return right({
      jobs: result,
      meta: jobs.meta
    });
  }
}
