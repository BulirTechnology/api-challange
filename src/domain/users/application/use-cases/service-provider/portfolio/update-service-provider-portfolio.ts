import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  ServiceProvidersRepository,
  PortfoliosRepository,
  UsersRepository,
  SpecializationsRepository
} from "../../../repositories";

import { Portfolio } from "../../../../enterprise/portfolio";
import { checkNextStep } from "../../user/authentication/helper/setup-next-step";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateServiceProviderPortfolioUseCaseRequest {
  language: LanguageSlug
  title: string
  userId: string
  id: string
  description: string
}

type UpdateServiceProviderPortfolioUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
    nextStep?: "PersonalInfo" | "Services" | "Portfolio"
  }
>

@Injectable()
export class UpdateServiceProviderPortfolioUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private portfolioRepository: PortfoliosRepository,
    private specializationsRepository: SpecializationsRepository,
  ) { }

  async execute({
    userId,
    title,
    id,
    description
  }: UpdateServiceProviderPortfolioUseCaseRequest): Promise<UpdateServiceProviderPortfolioUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User register not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const portfolio = await this.portfolioRepository.findById(id);

    if (!portfolio) {
      return left(new ResourceNotFoundError("Portfolio not found"));
    }

    const portfolioUpdated = Portfolio.create({
      title,
      serviceProviderId: serviceProvider.id,
      description,
      image1: portfolio.image1,
      image2: portfolio.image2,
      image3: portfolio.image3,
      image4: portfolio.image4,
      image5: portfolio.image5,
      image6: portfolio.image6
    }, new UniqueEntityID(id));

    await this.portfolioRepository.update(id, portfolioUpdated);

    let nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined = undefined;
    if (user.state === "SetupAccount") {
      nextStep = await checkNextStep(
        user,
        serviceProvider,
        this.specializationsRepository,
        this.portfolioRepository
      );
    }

    return right({
      message: "Updated the specialization repository",
      nextStep
    });
  }
}
