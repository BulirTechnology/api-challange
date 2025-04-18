import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { JobsRepository } from "../../repositories";
import { Job } from "@/domain/work/enterprise";
import {
  UsersRepository,
  AddressesRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServiceProviderNearJobsUseCaseRequest {
  language: LanguageSlug
  page: number
  serviceId: string
  postedDate: string
  expectedDate: string
  viewState: "PUBLIC" | "PRIVATE"
  priceSort: "HighToLow" | "LowToHight"
  userId: string
  rating: "1" | "2" | "3" | "4" | "5"
  categoryId: string
  latitude: number
  longitude: number
  perPage?: number
  title?: string
}

type FetchServiceProviderNearJobsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    jobs: Job[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServiceProviderNearJobsUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private jobsRepository: JobsRepository,
    private addressRepository: AddressesRepository
  ) { }

  async execute({
    page,
    serviceId,
    expectedDate,
    postedDate,
    viewState,
    userId,
    priceSort,
    title
  }: FetchServiceProviderNearJobsUseCaseRequest): Promise<FetchServiceProviderNearJobsUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const userAddress = await this.addressRepository.findMany({
      userId: user.id.toString(),
      page: 1
    });

    const jobs = await this.jobsRepository.findMany({
      page,
      serviceId,
      expectedDate,
      postedDate,
      statusBooked: true,
      statusClosed: false,
      statusOpen: true,
      viewStatePrivate: viewState === "PRIVATE",
      viewStatePublic: viewState === "PUBLIC",
      priceSort,
      title,
      address: {
        latitude: userAddress.data.length > 0 ? userAddress.data[0].latitude : 0,
        longitude: userAddress.data.length > 0 ? userAddress.data[0].longitude : 0,
      },
      accountType: "ServiceProvider",
      userId,
      serviceProviderId: serviceProvider.id.toString()
    });

    return right({
      jobs: jobs.data,
      meta: jobs.meta
    });
  }
}
