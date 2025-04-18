import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Portfolio } from "../../../../enterprise";
import {
  PortfoliosRepository,
  UsersRepository,
  ServiceProvidersRepository
} from "../../../repositories";

interface FetchPortfoliosUseCaseRequest {
  language: "en" | "pt"
  page: number
  perPage?: number
  userId: string
}

type FetchPortfoliosUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: Portfolio[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServiceProviderPortfoliosUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private portfoliosRepository: PortfoliosRepository
  ) { }

  async execute({
    page,
    userId,
    perPage
  }: FetchPortfoliosUseCaseRequest): Promise<FetchPortfoliosUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const portfolios = await this.portfoliosRepository.findMany({
      page,
      perPage,
      serviceProviderId: serviceProvider.id.toString()
    });

    return right({
      data: portfolios.data,
      meta: portfolios.meta
    });
  }
}
