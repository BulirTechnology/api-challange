import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  DocumentRepository,
  ServiceProvidersRepository
} from "../../../repositories";

import { ServiceProvider, Document, LanguageSlug } from "@/domain/users/enterprise";

interface UploadDocumentUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  listDocuments: {
    nif: string
    bi_front: string
    bi_back: string
  }
}

type UploadDocumentUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string,
    nextStep: string,
    serviceProvider: ServiceProvider
  }
>

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    private documentsRepository: DocumentRepository,
    private serviceProviderRepository: ServiceProvidersRepository
  ) { }

  async execute({
    listDocuments,
    serviceProviderId
  }: UploadDocumentUseCaseRequest): Promise<UploadDocumentUseCaseResponse> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const nifDocument = Document.create({
      serviceProviderId: new UniqueEntityID(serviceProviderId),
      title: "NIF",
      type: "NIF",
      url: listDocuments.nif,
    });
    const biFrontDocument = Document.create({
      serviceProviderId: new UniqueEntityID(serviceProviderId),
      title: "BI_BACK",
      type: "BI_BACK",
      url: listDocuments.bi_back,
    });
    const biBackDocument = Document.create({
      serviceProviderId: new UniqueEntityID(serviceProviderId),
      title: "BI_FRONT",
      type: "BI_FRONT",
      url: listDocuments.bi_front,
    });

    await this.documentsRepository.create(nifDocument);
    await this.documentsRepository.create(biFrontDocument);
    await this.documentsRepository.create(biBackDocument);

    return right({
      message: "File upload with success",
      nextStep: "SetPassword",
      serviceProvider: serviceProvider
    });
  }
}
