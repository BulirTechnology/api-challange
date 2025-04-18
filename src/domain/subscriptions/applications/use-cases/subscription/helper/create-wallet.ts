import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { WalletRepository } from "@/domain/payment/application/repositories";
import { Wallet } from "@/domain/payment/enterprise";

export async function createWallet(
  userId: string,
  walletRepository: WalletRepository
): Promise<Wallet> {
  const newWallet = Wallet.create({
    balance: 0,
    creditBalance: 0,
    userId: new UniqueEntityID(userId)
  });

  return walletRepository.create(newWallet);
}