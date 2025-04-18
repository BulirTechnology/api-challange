import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Message } from "@/domain/work/enterprise/message";
import { Message as PrismaMessage } from "@prisma/client";

export class PrismaMessageMapper {
  static toDomain(info: PrismaMessage): Message {
    return Message.create({
      content: info.content,
      sendById: new UniqueEntityID(info.sendById),
      conversationId: new UniqueEntityID(info.conversationId),
      readed: info.readed,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
    }, new UniqueEntityID(info.id));
  }
 
  static toPrisma(message: Message): PrismaMessage {
    return {
      id: message.id.toString(),
      content: message.content,
      readed: message.readed,
      conversationId: message.conversationId.toString(),
      sendById: message.sendById.toString(),
      createdAt: message.createdAt,
      updatedAt: new Date(),
    };
  }
}