import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { WalletRepository } from "../repositories";
import { Wallet } from "../../enterprise";

interface FetchWalletDetailsUseCaseRequest {
  walletId: string
}

type FetchWalletDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    wallet: Wallet
  }
>

@Injectable()
export class FetchWalletDetailsUseCase {
  constructor(
    private walletRepository: WalletRepository
  ) { }

  async execute({
    walletId
  }: FetchWalletDetailsUseCaseRequest): Promise<FetchWalletDetailsUseCaseResponse> {
    const wallet = await this.walletRepository.findById(walletId);

    if (!wallet) {
      return left(new ResourceNotFoundError(""));
    }

    return right({
      wallet,
    });
  }
}

