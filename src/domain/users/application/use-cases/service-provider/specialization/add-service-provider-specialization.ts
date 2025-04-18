import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  ServiceProvidersRepository,
  UsersRepository,
  PortfoliosRepository,
  SpecializationsRepository
} from "../../../repositories";
import { ServicesRepository } from "@/domain/work/application/repositories";

import { checkNextStep } from "../../user/authentication/helper/setup-next-step";

import { LanguageSlug, Rate, Specialization } from "../../../../enterprise";

interface AddServiceProviderSpecializationUseCaseRequest {
  language: LanguageSlug
  userId: string
  services: {
    title: string
    price: number
    rate: Rate
    serviceId: string
  }[]

}

type AddServiceProviderSpecializationUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
    nextStep?: "PersonalInfo" | "Services" | "Portfolio"
    specializations: Specialization[]
  }
>

@Injectable()
export class AddServiceProviderSpecializationUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private specializationsRepository: SpecializationsRepository,
    private portfoliosRepository: PortfoliosRepository,
    private servicesRepository: ServicesRepository
  ) { }

  async execute({
    userId,
    services,
    language
  }: AddServiceProviderSpecializationUseCaseRequest): Promise<AddServiceProviderSpecializationUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    for (const element of services) {
      const existentService = await this.servicesRepository.findById({
        id: element.serviceId,
        language
      });

      if (!existentService) {
        return left(new ResourceNotFoundError(`Service ${element.serviceId} not found`));
      }
    }

    let returnedSpecialization: Specialization[] = []
    for (const element of services) {
      const { price, rate, serviceId, title } = element;

      const existSpecialization = await this.specializationsRepository.findByServiceIdAndServiceProviderId({
        serviceId,
        serviceProviderId: serviceProvider.id.toString()
      });

      if (existSpecialization) {
        const specialization = Specialization.create({
          serviceProviderId: serviceProvider.id,
          title,
          price,
          rate,
          serviceId: new UniqueEntityID(serviceId)
        }, existSpecialization.id);

        const result = await this.specializationsRepository.update(existSpecialization.id.toString(), specialization);
        returnedSpecialization.push(result)
      } else {
        const specialization = Specialization.create({
          serviceProviderId: serviceProvider.id,
          title,
          price,
          rate,
          serviceId: new UniqueEntityID(serviceId)
        });

        const result = await this.specializationsRepository.create(specialization);
        returnedSpecialization.push(result)
      }

    }

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
      message: "Add the specialization repository",
      nextStep,
      specializations: returnedSpecialization
    });
  }
}
