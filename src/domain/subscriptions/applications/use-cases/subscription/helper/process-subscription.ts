import { right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { SubscriptionsRepository } from "../../../repositories";

import {
  TransactionRepository,
  WalletRepository
} from "@/domain/payment/application/repositories";
import {
  Transaction,
  Wallet
} from "@/domain/payment/enterprise";
import {
  Subscription,
  SubscriptionPlan
} from "@/domain/subscriptions/enterprise";

import { formatPrice } from "@/helpers/price";
import { PurchaseSubscriptionUseCaseResponse } from "../purchase-subscription";

export async function processSubscription({
  serviceProviderId,
  subscriptionPlan,
  subscriptionsRepository,
  transactionHistoryRepository,
  userId,
  wallet,
  walletRepository
}: {
  wallet: Wallet,
  subscriptionPlan: SubscriptionPlan,
  serviceProviderId: UniqueEntityID,
  userId: string,
  walletRepository: WalletRepository,
  transactionHistoryRepository: TransactionRepository,
  subscriptionsRepository: SubscriptionsRepository
}): Promise<PurchaseSubscriptionUseCaseResponse> {

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + subscriptionPlan.duration);

  const subscription = Subscription.create({
    endDate,
    serviceProviderId,
    startDate,
    status: 'ACTIVE',
    subscriptionPlanId: subscriptionPlan.id,
    updatedAt: new Date()
  });

  const updatedWallet = Wallet.create({
    balance: wallet.balance - subscriptionPlan.price,
    creditBalance: wallet.creditBalance,
    userId: new UniqueEntityID(userId)
  }, wallet.id);

  const transaction = Transaction.create({
    amount: subscriptionPlan.price,
    description: `Foi debitado ${formatPrice(subscriptionPlan.price + "")} da tua carteira, para a subscrição mensal do plano ${subscriptionPlan.name}`,
    descriptionEn: `${formatPrice(subscriptionPlan.price + "")} was debited from your wallet, for the purchase of ${subscriptionPlan.name} subscription`,
    jobId: null,
    status: "Completed",
    type: "SubscriptionPayment",
    walletId: wallet.id,
    promotionId: null
  });

  await walletRepository.update(updatedWallet);
  await transactionHistoryRepository.create(transaction);
  await subscriptionsRepository.create(subscription);

  return right({
    message: "Subscription updated successfully"
  });
}