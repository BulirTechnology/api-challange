import { Wallet } from "../../enterprise/wallet";
import { WalletPaginationParams } from "../params/wallet-params";

export abstract class WalletRepository {
  abstract findMany(params: WalletPaginationParams): Promise<Wallet[]>
  abstract findByUserId(userId: string): Promise<Wallet | null>
  abstract findById(id: string): Promise<Wallet | null>
  abstract create(wallet: Wallet): Promise<Wallet>
  abstract update(wallet: Wallet): Promise<Wallet>
}
