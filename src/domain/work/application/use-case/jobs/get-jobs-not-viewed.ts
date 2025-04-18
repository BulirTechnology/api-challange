import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface GetJobsNotViewedUseCaseRequest {
  userId: string
}

type GetJobsNotViewedUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    total: number
  }
>

@Injectable()
export class GetJobsNotViewedUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
  }: GetJobsNotViewedUseCaseRequest): Promise<GetJobsNotViewedUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const total = await this.serviceProviderRepository.countJobNotViewed(serviceProvider.id.toString());

    return right({
      total,
    });
  }
}
