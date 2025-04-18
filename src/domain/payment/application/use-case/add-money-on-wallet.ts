
import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  WalletRepository,
  TransactionRepository
} from "../repositories";
import {
  NotificationsRepository, PushNotificationRepository
} from "@/domain/users/application/repositories";

import {
  Wallet,
} from "../../enterprise";

import { formatPrice } from "@/helpers/price";
import { createWallet } from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";
import { createTransactionRegister } from "./helper/create-transaction-register";
import { createNotificationRegister } from "@/domain/notification/application/use-case/helper/create-notification-register";

interface AddMoneyOnWalletUseCaseCaseRequest {
  userId: string
  amount: number
}

type AddMoneyOnWalletUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    wallet: Wallet,
  }
>

@Injectable()
export class AddMoneyOnWalletUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private notificationRepository: NotificationsRepository,
    private pushNotificationRepository: PushNotificationRepository
  ) { }

  async execute({
    userId,
    amount
  }: AddMoneyOnWalletUseCaseCaseRequest): Promise<AddMoneyOnWalletUseCaseCaseResponse> {
    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet)
      wallet = await createWallet(userId, this.walletRepository);

    const walletToUpdate = Wallet.create({
      balance: wallet.balance + amount,
      creditBalance: wallet.creditBalance,
      userId: new UniqueEntityID(userId)
    }, wallet.id);

    const transactionCreated = await createTransactionRegister({
      amount,
      descriptionPt: `Foi adicionado ${formatPrice(amount + "")} a sua carteira`,
      descriptionEn: `${formatPrice(amount + "")} has been added to your wallet`,
      jobId: null,
      status: "Completed",
      type: "AddMoney",
      walletId: wallet.id,
      promotionId: null,
      transactionRepository: this.transactionRepository
    })
    await createNotificationRegister({
      descriptionEn: `${formatPrice(amount + "")} has been added to your wallet`,
      descriptionPt: `Foi adicionado ${formatPrice(amount + "")} a sua carteira`,
      language: 'pt',
      notificationRepository: this.notificationRepository,
      parentId: transactionCreated.id.toString(),
      titleEn: "Wallet charge",
      titlePt: "Carregamento",
      type: "MoneyAddedToWallet",
      userId: new UniqueEntityID(userId),
      pushNotificationRedirectTo: 'TRANSACTIONDETAILS',
      pushNotificationRepository: this.pushNotificationRepository
    })

    const walletUpdated = await this.walletRepository.update(walletToUpdate);

    return right({
      wallet: walletUpdated,
    });
  }
}
