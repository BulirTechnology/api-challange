import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { Service } from "../../../../enterprise";
import { ServicesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateServiceUseCaseRequest {
  title: string
  serviceId: string
  language: LanguageSlug
}

type UpdateServiceUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    service: Service
  }
>

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    private servicesRepository: ServicesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    title,
    serviceId,
    language
  }: UpdateServiceUseCaseRequest): Promise<UpdateServiceUseCaseResponse> {
    const service = await this.servicesRepository.findById({
      id: serviceId,
      language
    });

    if (!service) {
      return left(
        new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.sub_categories.not_found")
        ));
    }

    const serviceByTitle = await this.servicesRepository.findByTitle(title);

    if (serviceByTitle && serviceByTitle.id.toString() !== serviceId) {
      return left(new InvalidResourceError("Already exist an service with this name"));
    }

    const serviceToUpdate = Service.create({
      title: language === "pt" ? title : "",
      titleEn: language === "en" ? title : "",
      parentId: service.parentId
    }, service.id);

    const serviceUpdated = await this.servicesRepository.update(serviceToUpdate, language);

    return right({
      service: serviceUpdated
    });
  }
}
