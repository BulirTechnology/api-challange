import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Message } from "@/domain/work/enterprise";
import { MessagesRepository } from "../../repositories";

interface SaveMessageUseCaseRequest {
  userId: string
  content: string
  conversationId: string
}

type SaveMessageUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: Message
  }
>

@Injectable()
export class SaveMessageUseCase {
  constructor(private messagesRepository: MessagesRepository) { }

  async execute({
    content,
    conversationId,
    userId
  }: SaveMessageUseCaseRequest): Promise<SaveMessageUseCaseResponse> {
    const message = Message.create({
      content,
      sendById: new UniqueEntityID(userId),
      readed: false,
      conversationId: new UniqueEntityID(conversationId),
    });

    const messageCreated = await this.messagesRepository.create(message);

    return right({
      message: messageCreated
    });
  }
}
