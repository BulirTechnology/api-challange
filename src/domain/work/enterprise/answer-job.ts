import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface AnswerJobProps {
  jobId: UniqueEntityID
  questionId: UniqueEntityID
  serviceQuestionId?: UniqueEntityID | null
  value: string
  createdAt: Date
  updatedAt?: Date | null
}

export class AnswerJob extends Entity<AnswerJobProps> {
  get jobId() {
    return this.props.jobId;
  }
  get questionId() {
    return this.props.questionId;
  }
  get value() {
    return this.props.value;
  }
  get serviceQuestionId() {
    return this.props.serviceQuestionId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<AnswerJobProps, "createdAt">, id?: UniqueEntityID) {
    const answer = new AnswerJob({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return answer;
  }
}
