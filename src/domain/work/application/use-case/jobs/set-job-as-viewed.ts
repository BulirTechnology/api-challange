import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { JobsRepository } from "../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface SetJobAsViewedUseCaseRequest {
  userId: string,
  jobId: string
}

type SetJobAsViewedUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SetJobAsViewedUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private jobsRepository: JobsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    jobId,
  }: SetJobAsViewedUseCaseRequest): Promise<SetJobAsViewedUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const sp = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!sp) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.sp_not_found")));
    }

    const job = await this.jobsRepository.findById({
      accountType: "ServiceProvider",
      id: jobId,
      userId
    });

    if (!job) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")));
    }

    await this.serviceProvidersRepository.setJobAsViewed({ jobId, id: sp.id.toString() });

    return right(null);
  }
}
