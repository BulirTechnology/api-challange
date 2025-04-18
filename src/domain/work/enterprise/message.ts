import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface MessageProps {
  content: string
  sendById: UniqueEntityID
  conversationId: UniqueEntityID
  readed: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class Message extends Entity<MessageProps> {
  get content() {
    return this.props.content;
  }
  get sendById() {
    return this.props.sendById;
  }
  get readed() {
    return this.props.readed;
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

  static create(props: Optional<MessageProps, "createdAt">, id?: UniqueEntityID) {
    const message = new Message({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return message;
  }
}
