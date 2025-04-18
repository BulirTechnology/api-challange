import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface WalletProps {
  balance: number
  creditBalance: number
  userId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date
}

export class Wallet extends Entity<WalletProps> {
  get balance() {
    return this.props.balance;
  }
  get creditBalance() {
    return this.props.creditBalance;
  }
  get userId() {
    return this.props.userId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<WalletProps, "createdAt">, id?: UniqueEntityID) {
    const wallet = new Wallet({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return wallet;
  }
}
