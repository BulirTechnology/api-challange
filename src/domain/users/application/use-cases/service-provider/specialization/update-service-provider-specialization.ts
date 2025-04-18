import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  ServiceProvidersRepository,
  SpecializationsRepository,
  UsersRepository,
  PortfoliosRepository
} from "../../../repositories";

import { LanguageSlug, Rate, Specialization } from "../../../../enterprise";

import { checkNextStep } from "../../user/authentication/helper/setup-next-step";

interface UpdateServiceProviderSpecializationUseCaseRequest {
  language: LanguageSlug
  title: string
  userId: string
  price: number
  rate: Rate
  serviceId: string
  id: string
}

type UpdateServiceProviderSpecializationUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
    nextStep?: "PersonalInfo" | "Services" | "Portfolio"
  }
>

@Injectable()
export class UpdateServiceProviderSpecializationUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private specializationRepository: SpecializationsRepository,
    private portfolioRepository: PortfoliosRepository,
  ) { }

  async execute({
    userId,
    title,
    price,
    rate,
    serviceId,
    id
  }: UpdateServiceProviderSpecializationUseCaseRequest): Promise<UpdateServiceProviderSpecializationUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User register not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const specialization = await this.specializationRepository.findById(id);

    if (!specialization) {
      return left(new ResourceNotFoundError("Specialization"));
    }

    const specializationUpdated = Specialization.create({
      price,
      rate,
      serviceId: new UniqueEntityID(serviceId),
      serviceProviderId: serviceProvider.id,
      title,
    }, new UniqueEntityID(id));

    await this.specializationRepository.update(id, specializationUpdated);

    let nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined = undefined;
    if (user.state === "SetupAccount") {
      nextStep = await checkNextStep(
        user,
        serviceProvider,
        this.specializationRepository,
        this.portfolioRepository
      );
    }

    return right({
      message: "Updated the specialization repository",
      nextStep
    });
  }
}
