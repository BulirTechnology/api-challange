import { Transaction } from "@/domain/payment/enterprise/transaction";

export class TransactionPresenter {
  static toHTTP(transaction: Transaction) {
    return {
      id: transaction.id.toString(),
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      type: transaction.type,
      created_at: transaction.createdAt,
      wallet_id: transaction.walletId.toString(),
    };
  }
}