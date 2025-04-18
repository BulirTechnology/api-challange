import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { SubscriptionPlan } from "@/domain/subscriptions/enterprise";
import {
  SubscriptionPlanRepository
} from "../../repositories";

interface FetchSubscriptionPlanDetailsUseCaseCaseRequest {
  planId: string
}

type FetchSubscriptionPlanDetailsUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    plan: SubscriptionPlan,
  }
>

@Injectable()
export class FetchSubscriptionPlanDetailsUseCase {
  constructor(
    private subscriptionPlanRepository: SubscriptionPlanRepository
  ) { }

  async execute({
    planId
  }: FetchSubscriptionPlanDetailsUseCaseCaseRequest): Promise<FetchSubscriptionPlanDetailsUseCaseCaseResponse> {
    const plan = await this.subscriptionPlanRepository.findById(planId);

    if (!plan) {
      return left(new ResourceNotFoundError(""));
    }

    return right({
      plan,
    });
  }
}
