import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  Either,
  right
} from "@/core/either";

import { WalletRepository } from "../repositories";
import {
  createWallet
} from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";

interface FetchClientWalletBalanceUseCaseRequest {
  userId: string
}

export type ClientWallet = {
  id: UniqueEntityID
  balance: number
}

type FetchClientWalletBalanceUseCaseResponse = Either<
  null,
  {
    wallet: ClientWallet
  }
>

@Injectable()
export class FetchClientWalletBalanceUseCase {
  constructor(
    private walletRepository: WalletRepository
  ) { }

  async execute({
    userId
  }: FetchClientWalletBalanceUseCaseRequest): Promise<FetchClientWalletBalanceUseCaseResponse> {
    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet)
      wallet = await createWallet(userId, this.walletRepository);

    return right({
      wallet: {
        balance: wallet.balance,
        id: wallet.id
      },
    });
  }
}