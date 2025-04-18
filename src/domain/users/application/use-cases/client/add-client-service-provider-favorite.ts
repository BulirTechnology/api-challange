import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProvidersRepository,
  UsersRepository,
  ClientServiceProviderFavoriteRepository,
  ClientsRepository
} from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface AddClientServiceProviderFavoriteUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  userId: string,
}

type AddClientServiceProviderFavoriteUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AddClientServiceProviderFavoriteUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private clientServiceProviderRepository: ClientServiceProviderFavoriteRepository,
    private clientRepository: ClientsRepository
  ) { }

  async execute({
    userId,
    serviceProviderId
  }: AddClientServiceProviderFavoriteUseCaseRequest): Promise<AddClientServiceProviderFavoriteUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const client = await this.clientRepository.findByEmail(user.email);
    if (!client) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findById(serviceProviderId);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    await this.clientServiceProviderRepository.createOrDelete(client.id.toString(), serviceProvider.id.toString());

    return right({
      message: "Atualizado",
    });
  }
}
