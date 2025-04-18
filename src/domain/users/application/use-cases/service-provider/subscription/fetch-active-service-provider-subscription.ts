import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { SubscriptionsRepository } from "@/domain/subscriptions/applications/repositories";
import { Subscription } from "@/domain/subscriptions/enterprise/subscription";
import {
  ServiceProvidersRepository,
  UsersRepository
} from "../../../repositories";

interface FetchActiveServiceProviderSubscriptionUseCaseRequest {
  userId: string
}

type FetchActiveServiceProviderSubscriptionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: Subscription
  }
>

@Injectable()
export class FetchActiveServiceProviderSubscriptionUseCase {
  constructor(
    private subscriptionRepository: SubscriptionsRepository,
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
  ) { }

  async execute({
    userId
  }: FetchActiveServiceProviderSubscriptionUseCaseRequest):
    Promise<FetchActiveServiceProviderSubscriptionUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const subscription = await this.subscriptionRepository.findActiveSubscription({
      serviceProviderId: serviceProvider.id.toString(),
    });

    if (!subscription) {
      return left(new ResourceNotFoundError("Subscription not found"));
    }

    return right({
      data: subscription,
    });
  }
}
