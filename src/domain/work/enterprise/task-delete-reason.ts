import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface TaskDeleteReasonProps {
  value: string
  createdAt: Date
  updatedAt?: Date | null
}

export class TaskDeleteReason extends Entity<TaskDeleteReasonProps> {
  get value() {
    return this.props.value;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<TaskDeleteReasonProps, "createdAt">, id?: UniqueEntityID) {
    const taskDeleteReason = new TaskDeleteReason({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return taskDeleteReason;
  }
}
