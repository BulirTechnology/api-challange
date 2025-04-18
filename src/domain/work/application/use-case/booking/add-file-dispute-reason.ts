import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { FileDisputeReason } from "../../../enterprise";
import { FileDisputeReasonRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface AddFileDisputeReasonUseCaseRequest {
  language: LanguageSlug
  value: string
}

type AddFileDisputeReasonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    reason: FileDisputeReason
  }
>

@Injectable()
export class AddFileDisputeReasonUseCase {
  constructor(
    private fileDisputeReasonRepository: FileDisputeReasonRepository
  ) { }

  async execute({
    value,
    language
  }: AddFileDisputeReasonUseCaseRequest): Promise<AddFileDisputeReasonUseCaseResponse> {
    const reasonByName = await this.fileDisputeReasonRepository.findByName(value)

    if (reasonByName) {
      return left(new InvalidResourceError("Already exist an reason with this name"))
    }

    const reason = FileDisputeReason.create({
      value: language === "pt" ? value : "",
      valueEn: language === "en" ? value : "",
    });

    const reasonCreated = await this.fileDisputeReasonRepository.create(reason);

    return right({
      reason: reasonCreated
    });
  }
}
