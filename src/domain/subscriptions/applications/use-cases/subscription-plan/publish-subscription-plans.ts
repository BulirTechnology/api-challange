import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { SubscriptionPlanRepository } from "../../repositories";

interface PublishSubscriptionPlanUseCaseRequest {
  subscriptionPlanId: string
}

type PublishSubscriptionPlanUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class PublishSubscriptionPlanUseCase {
  constructor(
    private subscriptionPlanRepository: SubscriptionPlanRepository,
  ) { }

  async execute({
    subscriptionPlanId
  }: PublishSubscriptionPlanUseCaseRequest):
    Promise<PublishSubscriptionPlanUseCaseResponse> {
    await this.subscriptionPlanRepository.publish({ subscriptionPlanId });

    return right({
      message: "Published"
    });
  }
}
