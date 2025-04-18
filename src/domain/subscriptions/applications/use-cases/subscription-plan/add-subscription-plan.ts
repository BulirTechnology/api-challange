import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { InvalidResourceError } from "@/core/errors/invalid-resource-error";

import { SubscriptionPlan } from "@/domain/subscriptions/enterprise";
import { SubscriptionPlanRepository } from "../../repositories";

interface AddSubscriptionPlantUseCaseCaseRequest {
  creditsPerJob: number
  description: string
  discountType: "FIXED" | "TIERED"
  discountValue: number
  duration: number
  name: string
  price: number
  isDefault: boolean
  rollOverCredit: number
  benefits: string[]
}

type AddSubscriptionPlantUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    plan: SubscriptionPlan,
  }
>

@Injectable()
export class AddSubscriptionPlantUseCase {
  constructor(
    private subscriptionPlanRepository: SubscriptionPlanRepository
  ) { }

  async execute({
    creditsPerJob,
    description,
    discountType,
    discountValue,
    duration,
    name,
    price,
    rollOverCredit,
    benefits,
    isDefault
  }: AddSubscriptionPlantUseCaseCaseRequest): Promise<AddSubscriptionPlantUseCaseCaseResponse> {
    const planName = await this.subscriptionPlanRepository.findByName(name)

    if (planName) {
      return left(new InvalidResourceError("Already exist an plan with this name"))
    }

    const plan = SubscriptionPlan.create({
      creditsPerJob,
      description,
      discountType,
      discountValue,
      benefits,
      duration,
      name,
      price,
      rollOverCredit,
      status: "INACTIVE",
      isDefault,
      updatedAt: new Date(),
      createdAt: new Date()
    });

    const planCreated = await this.subscriptionPlanRepository.create(plan);

    return right({
      plan: planCreated,
    });
  }
}
