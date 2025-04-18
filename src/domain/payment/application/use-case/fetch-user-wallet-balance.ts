import { Injectable } from "@nestjs/common";

import {
  Either,
  right
} from "@/core/either";

import { WalletRepository } from "../repositories";
import { Wallet } from "../../enterprise";
import { createWallet } from "@/domain/subscriptions/applications/use-cases/subscription/helper/create-wallet";

interface FetchUserWalletBalanceUseCaseRequest {
  userId: string
}

type FetchUserWalletBalanceUseCaseResponse = Either<
  null,
  {
    wallet: Wallet
  }
>

@Injectable()
export class FetchUserWalletBalanceUseCase {
  constructor(
    private walletRepository: WalletRepository
  ) { }

  async execute({
    userId
  }: FetchUserWalletBalanceUseCaseRequest): Promise<FetchUserWalletBalanceUseCaseResponse> {
    let wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet)
      wallet = await createWallet(userId, this.walletRepository);

    return right({
      wallet,
    });
  }
}

