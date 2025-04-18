import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { JobCancelReason } from "../../../../enterprise";
import { JobCancelReasonRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface AddJobCancelReasonUseCaseRequest {
  language: LanguageSlug
  value: string
}

type AddJobCancelReasonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    jobCancelReason: JobCancelReason
  }
>

@Injectable()
export class AddJobCancelReasonUseCase {
  constructor(
    private jobCancelReasonRepository: JobCancelReasonRepository
  ) { }

  async execute({
    value,
    language
  }: AddJobCancelReasonUseCaseRequest): Promise<AddJobCancelReasonUseCaseResponse> {
    const jobCancelReason = await this.jobCancelReasonRepository.findByName({
      language,
      name: value
    })

    if (jobCancelReason) {
      return left(new InvalidResourceError("Already exist an job cancel with this name"))
    }

    const job = JobCancelReason.create({
      value: language === "pt" ? value : "",
      valueEn: language === "en" ? value : "",
    });

    const jobCancelReasonCreated = await this.jobCancelReasonRepository.create(job);

    return right({
      jobCancelReason: jobCancelReasonCreated
    });
  }
}
