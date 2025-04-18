import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface FileDisputeReasonProps {
  value: string
  valueEn: string
  createdAt: Date
  updatedAt?: Date | null
}

export class FileDisputeReason extends Entity<FileDisputeReasonProps> {
  get value() {
    return this.props.value;
  }
  get valueEn() {
    return this.props.valueEn;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<FileDisputeReasonProps, "createdAt">, id?: UniqueEntityID) {
    const fileDisputeReason = new FileDisputeReason({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return fileDisputeReason;
  }
}
