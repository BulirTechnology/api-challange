import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { Message } from "./message";

export type ConversationResult = {
  id: string
  title: string
  profileUrl: string
  name: string
  lastMessage: string
  time: string
  bookingId: UniqueEntityID
  totalUnreadMessage: number
  isBookingCompleted: boolean
  serviceProviderId: string
  clientId: string
  createdAt: Date
  updatedAt: Date
}

export interface ConversationProps {
  bookingId: UniqueEntityID
  messages: Message[]
  createdAt: Date
  updatedAt?: Date | null
}

export class Conversation extends Entity<ConversationProps> {
  get bookingId() {
    return this.props.bookingId;
  }
  get messages() {
    return this.props.messages;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<ConversationProps, "createdAt">, id?: UniqueEntityID) {
    const conversation = new Conversation({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return conversation;
  }
}
