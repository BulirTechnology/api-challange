import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { JobsRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface ClientCancelJobUseCaseRequest {
  language: LanguageSlug
  userId: string,
  jobId: string
  reasonId: string
  description: string
}

type ClientCancelJobUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class ClientCancelJobUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private jobsRepository: JobsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    jobId,
    userId,
    description,
    reasonId
  }: ClientCancelJobUseCaseRequest): Promise<ClientCancelJobUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const job = await this.jobsRepository.findById({
      accountType: "Client",
      id: jobId,
      userId
    });

    if (!job) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")));
    }

    if (job.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")));
    }

    await this.jobsRepository.cancelJob({
      id: jobId,
      state: "CLOSED",
      description,
      reasonId
    });

    return right({
      message: processI18nMessage(this.i18n, "errors.job.job_cancel")
    });
  }
}
