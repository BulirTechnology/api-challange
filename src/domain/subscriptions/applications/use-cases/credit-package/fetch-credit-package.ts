import { Injectable } from "@nestjs/common";
import {
  Either,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { CreditPackage } from "@/domain/subscriptions/enterprise";
import { CreditPackageRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchCreditPackageUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ALL"
}

type FetchCreditPackageUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: CreditPackage[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchCreditPackageUseCase {
  constructor(
    private creditPackageRepository: CreditPackageRepository,
  ) { }

  async execute({
    page,
    status,
    perPage
  }: FetchCreditPackageUseCaseRequest):
    Promise<FetchCreditPackageUseCaseResponse> {
    const response = await this.creditPackageRepository.findMany({
      page,
      status,
      perPage: perPage ?? 10
    });

    return right({
      data: response.data,
      meta: response.meta
    });
  }
}
