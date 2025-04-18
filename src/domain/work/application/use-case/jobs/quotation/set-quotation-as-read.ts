import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";

import {
  JobsRepository,
  QuotationsRepository
} from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface SetQuotationAsReadUseCaseRequest {
  language: LanguageSlug
  userId: string,
  jobId: string
  quotationId: string
}

type SetQuotationAsReadUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SetQuotationAsReadUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private jobsRepository: JobsRepository,
    private quotationsRepository: QuotationsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    jobId,
    quotationId,
  }: SetQuotationAsReadUseCaseRequest): Promise<SetQuotationAsReadUseCaseResponse> {
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

    const quotation = await this.quotationsRepository.findById(quotationId);

    if (quotation?.jobId.toString() !== job.id.toString()) {
      return left(new ResourceNotFoundError(
        processI18nMessage(this.i18n, "errors.quotation.not_found")));
    }

    await this.quotationsRepository.setAsRead(quotationId);

    return right(null);
  }
}
