import { Injectable } from "@nestjs/common";
import {
  Either,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { DiscountCommission } from "@/domain/subscriptions/enterprise";
import {
  DiscountCommissionRepository
} from "../../repositories/discount-commission-repository";

interface AddDiscountCommissionUseCaseCaseRequest {
  commission: number
  maxValue: number
  minValue: number
  subscriptionPlanId: string
}

type AddDiscountCommissionUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    discount: DiscountCommission,
  }
>

@Injectable()
export class AddDiscountCommissionUseCase {
  constructor(
    private discountCommissionRepository: DiscountCommissionRepository
  ) { }

  async execute({
    commission,
    maxValue,
    minValue,
    subscriptionPlanId
  }: AddDiscountCommissionUseCaseCaseRequest): Promise<AddDiscountCommissionUseCaseCaseResponse> {
    const discount = DiscountCommission.create({
      commission,
      planId: new UniqueEntityID(subscriptionPlanId),
      maxValue,
      minValue,
      status: "DRAFT",
      updatedAt: new Date(),
      createdAt: new Date()
    });

    const planCreated = await this.discountCommissionRepository.create(discount);

    return right({
      discount: planCreated,
    });
  }
}
