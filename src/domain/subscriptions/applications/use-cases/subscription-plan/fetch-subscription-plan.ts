import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { SubscriptionPlanRepository } from "../../repositories";
import { SubscriptionPlan } from "@/domain/subscriptions/enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchSubscriptionPlansUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  /* userId: string */
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ALL"
}

type FetchSubscriptionPlansUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: SubscriptionPlan[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchSubscriptionPlansUseCase {
  constructor(
    private subscriptionPlanRepository: SubscriptionPlanRepository,
  ) { }

  async execute({
    page,
    status,
    perPage
  }: FetchSubscriptionPlansUseCaseRequest):
    Promise<FetchSubscriptionPlansUseCaseResponse> {
    const response = await this.subscriptionPlanRepository.findMany({
      page,
      status,
      perPage
    });

    return right({
      data: response.data,
      meta: response.meta
    });
  }
}
