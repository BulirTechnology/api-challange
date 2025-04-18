import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  DiscountType,
  SubscriptionPlanStatus
} from "@/domain/subscriptions/enterprise";
import {
  SubscriptionPlanRepository,
  SubscriptionsRepository
} from "@/domain/subscriptions/applications/repositories";
import {
  ServiceProvidersRepository,
  UsersRepository
} from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchServiceProviderSubscriptionsUseCaseRequest {
  language: LanguageSlug
  page: number
  userId: string
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ALL"
}

export type ServiceProviderSubscriptionProps = {
  id: string
  name: string
  description: string
  price: number
  duration: number
  discountType: DiscountType
  rollOverCredit: number
  creditsPerJob: number
  discountValue: number
  benefits: string[]
  status: SubscriptionPlanStatus
  isActive: boolean
}

type FetchServiceProviderSubscriptionsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    data: ServiceProviderSubscriptionProps[]
  }
>

@Injectable()
export class FetchServiceProviderSubscriptionsUseCase {
  constructor(
    private subscriptionPlanRepository: SubscriptionPlanRepository,
    private subscriptionRepository: SubscriptionsRepository,
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
  ) { }

  async execute({
    page,
    status,
    userId
  }: FetchServiceProviderSubscriptionsUseCaseRequest):
    Promise<FetchServiceProviderSubscriptionsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User account not found"));
    }

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service provider not found"));
    }

    const response = await this.subscriptionPlanRepository.findMany({
      page,
      status
    });

    const responseResult: ServiceProviderSubscriptionProps[] = [];

    for (const element of response.data) {
      const itemValue = element;

      const isActive = await this.subscriptionRepository.hasSpWithThisSubscription({
        serviceProviderId: serviceProvider.id.toString(),
        planId: itemValue.id.toString()
      });

      responseResult.push({
        id: itemValue.id.toString(),
        benefits: itemValue.benefits,
        creditsPerJob: itemValue.creditsPerJob,
        description: itemValue.description,
        discountType: itemValue.discountType,
        discountValue: itemValue.discountValue,
        duration: itemValue.duration,
        isActive,
        name: itemValue.name,
        price: itemValue.price,
        rollOverCredit: itemValue.rollOverCredit,
        status: itemValue.status
      });
    }

    return right({
      data: responseResult
    });
  }
}
