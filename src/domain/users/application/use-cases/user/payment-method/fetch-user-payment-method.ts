import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";

import { PaymentMethod } from "@/domain/users/enterprise";

import { PaymentMethodsRepository } from "../../../repositories";

interface FetchUserPaymentMethodsUseCaseRequest {
  language: "en" | "pt"
  page: number
  userId: string
}

type FetchUserPaymentMethodsUseCaseResponse = Either<
  null,
  {
    paymentMethods: PaymentMethod | null
  }
>

@Injectable()
export class FetchUserPaymentMethodsUseCase {
  constructor(private userPaymentMethodsRepository: PaymentMethodsRepository) { }

  async execute({
    userId
  }: FetchUserPaymentMethodsUseCaseRequest): Promise<FetchUserPaymentMethodsUseCaseResponse> {
    const userPaymentMethods = await this.userPaymentMethodsRepository.findByUserId(userId);

    return right({
      paymentMethods: userPaymentMethods,
    });
  }
}
