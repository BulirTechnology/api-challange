import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";

import { ConversationsRepository } from "../../repositories";

interface JoinConversationUseCaseRequest {
  conversationId: string
  socketId: string
  userId: string
}

type JoinConversationUseCaseResponse = Either<
  null,
  null
>

@Injectable()
export class JoinConversationUseCase {
  constructor(private conversationsRepository: ConversationsRepository) { }

  async execute({
    conversationId,
    socketId,
  }: JoinConversationUseCaseRequest): Promise<JoinConversationUseCaseResponse> {
    await this.conversationsRepository.joinConversation({
      conversationId,
      socketId
    });

    return right(null);
  }
}
