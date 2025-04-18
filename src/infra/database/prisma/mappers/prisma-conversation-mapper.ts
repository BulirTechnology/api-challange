import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Conversation } from "@/domain/work/enterprise/conversation";
import { Conversation as PrismaConversation } from "@prisma/client";

export class PrismaConversationMapper {
  static toDomain(info: PrismaConversation): Conversation {
    return Conversation.create({
      bookingId: new UniqueEntityID(info.bookingId),
      messages: [],
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(conversation: Conversation): PrismaConversation {
    return {
      id: conversation.id.toString(),
      bookingId: conversation.bookingId.toString(),
      createdAt: conversation.createdAt,
      updatedAt: new Date(),
    };
  }
}