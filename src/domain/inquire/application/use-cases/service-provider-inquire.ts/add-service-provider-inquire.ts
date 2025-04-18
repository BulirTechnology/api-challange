import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProviderInquire,
  WayToWork,
  AgeGroup,
  LuandaCity
} from "@/domain/inquire/enterprise";

import { ServiceProviderInquiresRepository } from "../../repositories";

interface AddServiceProviderInquireUseCaseRequest {
  serviceProvider: {
    emailOrNumber: string
    city: LuandaCity
    whereLeave: string
    ageGroup: AgeGroup
    preferredServices: string[]
    wayToWork: WayToWork,
    createdAt: Date
  },
}

type AddServiceProviderInquireUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AddServiceProviderInquireUseCase {
  constructor(
    private serviceProviderInquireRepository: ServiceProviderInquiresRepository
  ) { }

  async execute({
    serviceProvider
  }: AddServiceProviderInquireUseCaseRequest): Promise<AddServiceProviderInquireUseCaseResponse> {

    const inquire = ServiceProviderInquire.create({
      ageGroup: serviceProvider.ageGroup,
      city: serviceProvider.city,
      emailOrNumber: serviceProvider.emailOrNumber,
      preferredServices: serviceProvider.preferredServices,
      wayToWork: serviceProvider.wayToWork,
      whereLeave: serviceProvider.whereLeave,
      createdAt: serviceProvider.createdAt

    });

    await this.serviceProviderInquireRepository.create(inquire);

    return right({
      message: "Operação terminada com sucesso!"
    });
  }
}
