import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { HashGenerator } from "../../../cryptography/hash-generator";

import { LanguageSlug, ServiceProvider } from "@/domain/users/enterprise";
import {
  ServiceProvidersRepository,
  UsersRepository
} from "../../../repositories";

interface SetupServiceProviderPasswordUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  password: string
}

type SetupServiceProviderPasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string,
    nextStep: string,
    serviceProvider: ServiceProvider
  }
>

@Injectable()
export class SetupServiceProviderPasswordUseCase {
  constructor(
    private serviceProviderRepository: ServiceProvidersRepository,
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) { }

  async execute({
    password,
    serviceProviderId
  }: SetupServiceProviderPasswordUseCaseRequest): Promise<SetupServiceProviderPasswordUseCaseResponse> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    await this.usersRepository.updatePassword(serviceProvider.userId.toString(), hashedPassword);

    return right({
      message: "Password updated",
      nextStep: "AddService",
      serviceProvider: serviceProvider
    });
  }
}
