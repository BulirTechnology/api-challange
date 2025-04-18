import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { InvalidResourceError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Service } from "../../../../enterprise";
import { ServicesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface CreateServiceUseCaseRequest {
  title: string
  parentId: string
  language: LanguageSlug
}

type CreateServiceUseCaseResponse = Either<
  InvalidResourceError,
  {
    service: Service
  }
>

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private servicesRepository: ServicesRepository,
  ) { }

  async execute({
    title,
    parentId,
    language
  }: CreateServiceUseCaseRequest): Promise<CreateServiceUseCaseResponse> {
    const serviceWithSameName = await this.servicesRepository.findByTitle(title)

    if (serviceWithSameName) {
      return left(new InvalidResourceError("Already exist service with same name"))
    }

    const service = Service.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      parentId: new UniqueEntityID(parentId)
    });

    const serviceCreated = await this.servicesRepository.create(service);

    if (!serviceCreated) {
      return left(new InvalidResourceError("Service not created"))
    }

    return right({
      service: serviceCreated,
    });
  }
}
