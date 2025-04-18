import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProvidersRepository,
  PortfoliosRepository,
  UsersRepository
} from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface DeleteServiceProviderPortfolioUseCaseRequest {
  language: LanguageSlug
  userId: string
  id: string
}

type DeleteServiceProviderPortfolioUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class DeleteServiceProviderPortfolioUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private portfolioRepository: PortfoliosRepository
  ) { }

  async execute({
    userId,
    id
  }: DeleteServiceProviderPortfolioUseCaseRequest): Promise<DeleteServiceProviderPortfolioUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const specialization = await this.portfolioRepository.findById(id);

    if (!specialization) {
      return left(new ResourceNotFoundError("Specialization not found"));
    }

    await this.portfolioRepository.delete(id);

    return right({
      message: "Deleted the specialization repository",
    });
  }
}
