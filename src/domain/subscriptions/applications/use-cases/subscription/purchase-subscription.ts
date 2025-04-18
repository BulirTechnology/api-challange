import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  SubscriptionPlanRepository
} from "../../repositories/subscription-plan-repository";

import {
  WalletRepository,
  TransactionRepository
} from "@/domain/payment/application/repositories";

import {
  InsufficientBalanceError
} from "@/domain/payment/application/use-case/errors";

import { SubscriptionsRepository } from "../../repositories";
import {
  ServiceProvidersRepository,
  UsersRepository
} from "@/domain/users/application/repositories";

import { createWallet } from "./helper/create-wallet";
import { validateSubscriptionPlan } from "./helper/validate-subscription-plan";
import { processSubscription } from "./helper/process-subscription";

interface PurchaseSubscriptionUseCaseRequest {
  userId: string
  planId: string
}

export type PurchaseSubscriptionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class PurchaseSubscriptionUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionHistoryRepository: TransactionRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository,
    private subscriptionsRepository: SubscriptionsRepository,
    private usersRepository: UsersRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
  ) { }

  async execute({
    userId,
    planId
  }: PurchaseSubscriptionUseCaseRequest): Promise<PurchaseSubscriptionUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return left(new ResourceNotFoundError("User account not found"));

    const serviceProvider = await this.serviceProvidersRepository.findByEmail(user.email);
    if (!serviceProvider) return left(new ResourceNotFoundError("Service provider not found"));

    let wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet)
      wallet = await createWallet(
        userId,
        this.walletRepository
      );

    const subscriptionPlan = await this.subscriptionPlanRepository.findById(planId);
    const validationError =
      await validateSubscriptionPlan({
        serviceProviderId: serviceProvider.id.toString(),
        subscriptionPlan: subscriptionPlan!,
        subscriptionsPlanRepository: this.subscriptionPlanRepository,
        subscriptionsRepository: this.subscriptionsRepository,
      });

    if (validationError) return left(validationError);

    if (wallet.balance < subscriptionPlan!.price)
      return left(new InsufficientBalanceError());

    return processSubscription({
      wallet,
      subscriptionPlan: subscriptionPlan!,
      serviceProviderId: serviceProvider.id,
      userId,
      subscriptionsRepository: this.subscriptionsRepository,
      transactionHistoryRepository: this.transactionHistoryRepository,
      walletRepository: this.walletRepository
    });
  }
}
