import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface QuotationRejectReasonProps {
  value: string
  createdAt: Date
  updatedAt?: Date | null
}

export class QuotationRejectReason extends Entity<QuotationRejectReasonProps> {
  get value() {
    return this.props.value;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<QuotationRejectReasonProps, "createdAt">, id?: UniqueEntityID) {
    const quotationRejectReason = new QuotationRejectReason({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return quotationRejectReason;
  }
}
