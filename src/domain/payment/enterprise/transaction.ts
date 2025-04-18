import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type TransactionType =
  "PurchaseCredit" | 
  "DiscountCredit" |
  "ServiceFee" | 
  "Withdrawal" | 
  "Refund" | 
  "Promotion" | 
  "AddMoney" | 
  "SubscriptionDebts" | 
  "SubscriptionPayment" |
  "ServicePayment" |  
  "ServiceSalary" 

export type TransactionState =
  "Completed" |
  "Pending" | 
  "Cancelled" |
  "Used"

export interface TransactionProps {
  amount: number
  description: string
  descriptionEn: string
  type: TransactionType
  status: TransactionState
  jobId: UniqueEntityID | null
  promotionId: UniqueEntityID | null
  walletId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class Transaction extends Entity<TransactionProps> {
  get amount() {
    return this.props.amount;
  }
  get description() {
    return this.props.description;
  }
  get descriptionEn() {
    return this.props.descriptionEn;
  }
  get type() {
    return this.props.type;
  }
  get status() {
    return this.props.status;
  }
  get promotionId() {
    return this.props.promotionId;
  }
  get jobId() {
    return this.props.jobId;
  }
  get walletId() {
    return this.props.walletId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<TransactionProps, "createdAt">, id?: UniqueEntityID) {
    const transaction = new Transaction({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return transaction;
  }
}
