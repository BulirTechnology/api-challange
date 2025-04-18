import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { WalletRepository, TransactionRepository } from "../repositories";
import { Wallet } from "../../enterprise";
import { InsufficientBalanceError } from "./errors/insufficient-balance";

import {
  NotificationsRepository,
  PushNotificationRepository,
} from "@/domain/users/application/repositories";

import { formatPrice } from "@/helpers/price";
import { createWallet } from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";
import { createTransactionRegister } from "./helper/create-transaction-register";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface WithdrawMoneyOnWalletUseCaseCaseRequest {
  userId: string;
  amount: number;
}

type WithdrawMoneyOnWalletUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    wallet: Wallet;
  }
>;

@Injectable()
export class WithdrawMoneyOnWalletUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private notificationRepository: NotificationsRepository,
    private pushNotificationRepository: PushNotificationRepository
  ) {}

  async execute({
    userId,
    amount,
  }: WithdrawMoneyOnWalletUseCaseCaseRequest): Promise<WithdrawMoneyOnWalletUseCaseCaseResponse> {
    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) wallet = await createWallet(userId, this.walletRepository);

    if (wallet.balance - amount < 0) {
      return left(new InsufficientBalanceError());
    }

    const walletToUpdate = Wallet.create(
      {
        balance: wallet.balance - amount,
        creditBalance: wallet.creditBalance,
        userId: new UniqueEntityID(userId),
      },
      wallet.id
    );

    const transactionCreated = await createTransactionRegister({
      amount,
      descriptionPt: `Foi debidato ${formatPrice(amount + "")} da sua carteira`,
      descriptionEn: `A total of ${formatPrice(
        amount + ""
      )} has been debited from your wallet.`,
      jobId: null,
      status: "Pending",
      type: "Withdrawal",
      walletId: wallet.id,
      promotionId: null,
      transactionRepository: this.transactionRepository,
    });
    await createNotificationRegister({
      descriptionEn: `A total of ${formatPrice(
        amount + ""
      )} has been debited from your wallet.`,
      descriptionPt: `Foi debidato ${formatPrice(amount + "")} da sua carteira`,
      language: "pt",
      notificationRepository: this.notificationRepository,
      parentId: transactionCreated.id.toString(),
      titleEn: "Wallet debited",
      titlePt: "Debito",
      type: "MoneyWithdraw",
      userId: new UniqueEntityID(userId),
      pushNotificationRedirectTo: "TRANSACTIONDETAILS",
      pushNotificationRepository: this.pushNotificationRepository,
    });

    const walletUpdated = await this.walletRepository.update(walletToUpdate);

    return right({
      wallet: walletUpdated,
    });
  }
}
