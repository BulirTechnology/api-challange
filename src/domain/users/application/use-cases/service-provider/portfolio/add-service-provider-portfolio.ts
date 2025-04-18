import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProvidersRepository,
  PortfoliosRepository,
  UsersRepository,
  SpecializationsRepository
} from "../../../repositories";

import { LanguageSlug, Portfolio } from "../../../../enterprise";

import { checkNextStep } from "../../user/authentication/helper/setup-next-step";

interface AddServiceProviderPortfolioUseCaseRequest {
  language: LanguageSlug
  title: string
  userId: string,
  description: string
  imageUrls: {
    url: string
  }[]
}

type AddServiceProviderPortfolioUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
    portfolio: Portfolio
    nextStep?: "PersonalInfo" | "Services" | "Portfolio"
  }
>

@Injectable()
export class AddServiceProviderPortfolioUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private portfoliosRepository: PortfoliosRepository,
    private specializationsRepository: SpecializationsRepository,
  ) { }

  async execute({
    userId,
    title,
    description,
    imageUrls
  }: AddServiceProviderPortfolioUseCaseRequest): Promise<AddServiceProviderPortfolioUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const portfolio = Portfolio.create({
      serviceProviderId: serviceProvider.id,
      title,
      description,
      image1: imageUrls.length > 0 ? imageUrls[0].url : null,
      image2: imageUrls.length > 1 ? imageUrls[1].url : null,
      image3: imageUrls.length > 2 ? imageUrls[2].url : null,
      image4: imageUrls.length > 3 ? imageUrls[3].url : null,
      image5: imageUrls.length > 4 ? imageUrls[4].url : null,
      image6: imageUrls.length > 5 ? imageUrls[5].url : null
    });

    const result = await this.portfoliosRepository.create(portfolio);

    let nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined = undefined;
    if (user.state === "SetupAccount") {
      nextStep = await checkNextStep(
        user,
        serviceProvider,
        this.specializationsRepository,
        this.portfoliosRepository
      );
    }

    return right({
      message: "Portfolio created.",
      portfolio: result,
      nextStep
    });
  }
}
