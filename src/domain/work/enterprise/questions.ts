import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type QuestionOptions = {
  id: UniqueEntityID
  value: string
}

export type QuestionState = "ACTIVE" | "INACTIVE" | "DRAFT"
export type TypeQuestion = "SIMPLE" | "SINGLE_SELECT" | "SINGLE_SELECT_IMAGE" | "SINGLE_NUMBER" | "MULTIPLE_SELECT" | "BOOLEAN"

export interface QuestionProps {
  title: string
  type: TypeQuestion
  state: QuestionState
  serviceId: UniqueEntityID
  options?: QuestionOptions[]
  createdAt: Date
  updatedAt?: Date | null
}

export class Question extends Entity<QuestionProps> {
  get title() {
    return this.props.title;
  }
  get type() {
    return this.props.type;
  }
  get serviceId() {
    return this.props.serviceId;
  }
  get state() {
    return this.props.state;
  }
  get options() {
    return this.props.options;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<QuestionProps, "createdAt">, id?: UniqueEntityID) {
    const question = new Question({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return question;
  }
}
