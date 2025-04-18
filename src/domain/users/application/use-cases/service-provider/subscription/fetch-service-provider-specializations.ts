import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { LanguageSlug, Specialization } from "../../../../enterprise";

import {
  SpecializationsRepository,
  ServiceProvidersRepository,
  UsersRepository
} from "../../../repositories";

interface FetchSpecializationsUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  userId: string
}

type FetchSpecializationsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: Specialization[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServiceProviderSpecializationsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private specializationsRepository: SpecializationsRepository
  ) { }

  async execute({
    page,
    userId,
    perPage
  }: FetchSpecializationsUseCaseRequest): Promise<FetchSpecializationsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const specializations = await this.specializationsRepository.findMany({
      page,
      perPage,
      serviceProviderId: serviceProvider.id.toString()
    });

    return right({
      data: specializations.data,
      meta: specializations.meta
    });
  }
}
