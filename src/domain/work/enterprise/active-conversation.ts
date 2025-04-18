import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ActiveConversationProps {
  socketId: string
  conversationId?: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class ActiveConversation extends Entity<ActiveConversationProps> {
  get socketId() {
    return this.props.socketId;
  }
  get conversationId() {
    return this.props.conversationId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<ActiveConversationProps, "createdAt">, id?: UniqueEntityID) {
    const answer = new ActiveConversation({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return answer;
  }
}
