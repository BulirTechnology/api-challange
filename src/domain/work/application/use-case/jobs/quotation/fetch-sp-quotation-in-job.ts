import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import {
  JobsRepository,
  QuotationsRepository
} from "../../../repositories";
import {
  ClientsRepository,
  UsersRepository
} from "@/domain/users/application/repositories";

import { Quotation } from "@/domain/work/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchSpQuotationInJobUseCaseRequest {
  serviceProviderId: string
  jobId: string
  userId: string
}

type FetchSpQuotationInJobUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    quotations: Quotation[]
  }
>

@Injectable()
export class FetchSpQuotationInJobUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private jobsRepository: JobsRepository,
    private quotationsRepository: QuotationsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    jobId,
    serviceProviderId,
    userId
  }: FetchSpQuotationInJobUseCaseRequest): Promise<FetchSpQuotationInJobUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const job = await this.jobsRepository.findById({
      id: jobId,
      accountType: "Client",
      userId
    });

    if (!job) return left(new InvalidResourceError("Job not found"))

    if (job.clientId.toString() !== client.id.toString())
      return left(new InvalidResourceError("Job not found"))

    const quotations = await this.quotationsRepository.findManyOfServiceProvider({
      jobId,
      serviceProviderId
    })

    return right({
      quotations
    });
  }
}
