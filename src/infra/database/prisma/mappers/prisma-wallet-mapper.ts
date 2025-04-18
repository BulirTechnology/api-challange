import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Wallet } from "@/domain/payment/enterprise/wallet";

import { Wallet as PrismaWallet } from "@prisma/client";

export class PrismaWalletMapper {
  static toDomain(info: PrismaWallet): Wallet {
    return Wallet.create({
      balance: info.balance,
      creditBalance: info.creditBalance,
      userId: new UniqueEntityID(info.userId)
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(wallet: Wallet): PrismaWallet {
    return {
      id: wallet.id.toString(),
      balance: wallet.balance,
      creditBalance: wallet.creditBalance,
      userId: wallet.userId.toString()
    };
  }
}