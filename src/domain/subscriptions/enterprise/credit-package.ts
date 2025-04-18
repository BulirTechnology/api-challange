import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type CreditPackageStatus = "ACTIVE" | "DRAFT" | "INACTIVE"

export interface CreditPackageProps {
  amount: number
  name: string
  vat: number
  status: CreditPackageStatus
  totalCredit: number
  createdAt: Date
  updatedAt: Date
}

export class CreditPackage extends Entity<CreditPackageProps> {
  get amount() {
    return this.props.amount;
  }
  get name() {
    return this.props.name;
  }
  get vat() {
    return this.props.vat;
  }
  get status() {
    return this.props.status;
  }
  get totalCredit() {
    return this.props.totalCredit;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<CreditPackageProps, "createdAt">, id?: UniqueEntityID) {
    const creditPackage = new CreditPackage({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return creditPackage;
  }
}
