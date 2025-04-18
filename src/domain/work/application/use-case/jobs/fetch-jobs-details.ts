import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { JobsRepository } from "../../repositories";
import { Job } from "@/domain/work/enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface FetchJobDetailsUseCaseRequest {
  language: LanguageSlug
  jobId: string
}

type FetchJobDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    job: Job
  }
>

@Injectable()
export class FetchJobDetailsJobsUseCase {
  constructor(
    private jobsRepository: JobsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    jobId
  }: FetchJobDetailsUseCaseRequest): Promise<FetchJobDetailsUseCaseResponse> {
    const job = await this.jobsRepository.findById({
      accountType: "Any",
      id: jobId,
      userId: ""
    });

    if (!job) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.job.not_found")));
    }

    return right({
      job
    });
  }
}
