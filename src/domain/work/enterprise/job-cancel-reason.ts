import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface JobCancelReasonProps {
  value: string
  valueEn: string
  createdAt: Date
  updatedAt?: Date | null
}

export class JobCancelReason extends Entity<JobCancelReasonProps> {
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

  static create(props: Optional<JobCancelReasonProps, "createdAt">, id?: UniqueEntityID) {
    const jobCancelReason = new JobCancelReason({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return jobCancelReason;
  }
}
