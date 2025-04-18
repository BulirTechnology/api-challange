import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { MessagesRepository } from "../../repositories";
import { Message } from "@/domain/work/enterprise";

interface FetchMessagesUseCaseRequest {
  page: number
  perPage?: number
  conversationId: string
  userId: string
}

type FetchMessagesUseCaseResponse = Either<
  null,
  {
    messages: Message[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchMessagesUseCase {
  constructor(private messagesRepository: MessagesRepository) { }

  async execute({
    page,
    conversationId,
    perPage,
    userId
  }: FetchMessagesUseCaseRequest): Promise<FetchMessagesUseCaseResponse> {
    const messages = await this.messagesRepository.findByConversationId({
      page,
      perPage,
      conversationId,
      userId,
    });

    return right({
      messages: messages.data,
      meta: messages.meta
    });
  }
}
