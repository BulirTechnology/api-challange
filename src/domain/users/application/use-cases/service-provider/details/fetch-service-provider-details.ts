import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProvidersRepository,
  UsersRepository
} from "../../../repositories";

import { ServiceProvider } from "@/domain/users/enterprise/service-provider";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServiceProviderDetailsUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  userId: string
}

type FetchServiceProviderDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: ServiceProvider
  }
>

@Injectable()
export class FetchServiceProviderDetailsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository
  ) { }

  async execute({
    serviceProviderId,
    userId
  }: FetchServiceProviderDetailsUseCaseRequest):
    Promise<FetchServiceProviderDetailsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }
    if (!serviceProviderId) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const serviceProviderDetails = await this.serviceProvidersRepository.findById(serviceProviderId);

    if (!serviceProviderDetails) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    return right({
      data: serviceProviderDetails,
    });
  }
}
