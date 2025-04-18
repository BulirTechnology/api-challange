import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { WalletRepository, TransactionRepository } from "../repositories";
import { Wallet } from "../../enterprise";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InsufficientBalanceError } from "./errors/insufficient-balance";
import {
  NotificationsRepository,
  PushNotificationRepository,
} from "@/domain/users/application/repositories";
import { createWallet } from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";
import { createTransactionRegister } from "./helper/create-transaction-register";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";
import { creditPrice } from "./helper/credit-packages";

interface PurchaseCreditUseCaseCaseRequest {
  userId: string;
  credit: "10" | "40" | "70";
}

type PurchaseCreditUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    wallet: Wallet;
  }
>;

@Injectable()
export class PurchaseCreditUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private notificationRepository: NotificationsRepository,
    private pushNotificationRepository: PushNotificationRepository
  ) {}

  async execute({
    userId,
    credit,
  }: PurchaseCreditUseCaseCaseRequest): Promise<PurchaseCreditUseCaseCaseResponse> {
    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) wallet = await createWallet(userId, this.walletRepository);

    if (wallet.balance < creditPrice[credit].total) {
      return left(new InsufficientBalanceError());
    }

    const walletToUpdate = Wallet.create(
      {
        balance: wallet.balance - creditPrice[credit].total,
        creditBalance: wallet.creditBalance + creditPrice[credit].totalCredit,
        userId: new UniqueEntityID(userId),
      },
      wallet.id
    );

    const transactionCreated = await createTransactionRegister({
      amount: creditPrice[credit].total,
      descriptionPt: `Foi debitado ${creditPrice[credit].total} da tua carteira, para a compra de ${creditPrice[credit].totalCredit}`,
      descriptionEn: `${creditPrice[credit].total} was debited from your wallet, for the purchase of ${creditPrice[credit].totalCredit}`,
      jobId: null,
      status: "Completed",
      type: "PurchaseCredit",
      walletId: wallet.id,
      promotionId: null,
      transactionRepository: this.transactionRepository,
    });
    await createNotificationRegister({
      descriptionEn: `${creditPrice[credit].total} was debited from your wallet, for the purchase of ${creditPrice[credit].totalCredit}`,
      descriptionPt: `Foi debitado ${creditPrice[credit].total} da tua carteira, para a compra de ${creditPrice[credit].totalCredit}`,
      language: "pt",
      notificationRepository: this.notificationRepository,
      parentId: transactionCreated.id.toString(),
      titleEn: "Purchase Credit",
      titlePt: "Crédito de compra",
      type: "PurchaseCredit",
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
