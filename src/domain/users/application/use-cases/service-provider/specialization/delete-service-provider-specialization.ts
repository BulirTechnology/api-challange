import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  ServiceProvidersRepository,
  SpecializationsRepository,
  UsersRepository
} from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface DeleteServiceProviderSpecializationUseCaseRequest {
  language: LanguageSlug
  userId: string
  id: string
}

type DeleteServiceProviderSpecializationUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class DeleteServiceProviderSpecializationUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private specializationRepository: SpecializationsRepository
  ) { }

  async execute({
    userId,
    id
  }: DeleteServiceProviderSpecializationUseCaseRequest): Promise<DeleteServiceProviderSpecializationUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider not found"));
    }

    const specialization = await this.specializationRepository.findById(id);

    if (!specialization) {
      return left(new ResourceNotFoundError("Specialization not found"));
    }

    await this.specializationRepository.deleteById(id);

    return right({
      message: "Deleted the specialization repository",
    });
  }
}
