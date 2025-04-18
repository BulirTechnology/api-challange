import { ClientWallet } from "@/domain/payment/application/use-case/fetch-client-wallet-balance";
import { Wallet } from "@/domain/payment/enterprise/wallet";

export class WalletPresenter {
  static toHTTP(wallet: Wallet) {
    return {
      id: wallet.id.toString(),
      balance: wallet.balance,
      credit_balance: wallet.creditBalance,
    };
  }
}

export class ClientWalletPresenter {
  static toHTTP(wallet: ClientWallet) {
    return {
      id: wallet.id.toString(),
      balance: wallet.balance,
    };
  }
}