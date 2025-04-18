import { WalletRepository } from "@/domain/payment/application/repositories/wallet-repository";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { WalletPaginationParams } from "@/domain/payment/application/params/wallet-params";
import { Wallet } from "@/domain/payment/enterprise/wallet";
import { PrismaWalletMapper } from "../mappers/prisma-wallet-mapper";

@Injectable()
export class PrismaWalletRepository implements WalletRepository {
  constructor(private prisma: PrismaService) { }

  async update(wallet: Wallet): Promise<Wallet> {
    const walletToUpdate = PrismaWalletMapper.toPrisma(wallet);

    const walletUpdated = await this.prisma.wallet.update({
      data: {
        balance: walletToUpdate.balance,
        creditBalance: walletToUpdate.creditBalance,
      },
      where: {
        id: walletToUpdate.id
      }
    });

    return PrismaWalletMapper.toDomain(walletUpdated);
  }
  async findByUserId(userId: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId
      }
    });

    if (!wallet) return null;

    return PrismaWalletMapper.toDomain(wallet);
  }
  async findMany(params: WalletPaginationParams): Promise<Wallet[]> {
    const page = params.page;

    const wallet = await this.prisma.wallet.findMany({
      where: {
        userId: params.userId,
      },
      take: 20,
      skip: (page - 1) * 20
    });

    return wallet.map(PrismaWalletMapper.toDomain);
  }
  async findById(id: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id
      }
    });

    if (!wallet) return null;

    return PrismaWalletMapper.toDomain(wallet);
  }
  async create(wallet: Wallet): Promise<Wallet> {
    const data = PrismaWalletMapper.toPrisma(wallet);

    const walletCreated = await this.prisma.wallet.create({
      data: {
        balance: data.balance,
        creditBalance: data.creditBalance,
        userId: data.userId
      }
    });

    const dataCreated = PrismaWalletMapper.toDomain({
      balance: walletCreated.balance,
      creditBalance: walletCreated.creditBalance,
      id: walletCreated.id,
      userId: walletCreated.userId
    });

    return dataCreated;
  }


}