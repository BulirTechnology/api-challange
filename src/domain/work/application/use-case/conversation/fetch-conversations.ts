import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { ConversationResult } from "@/domain/work/enterprise";
import { ConversationsRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchConversationsUseCaseRequest {
  page: number
  perPage?: number
  language: LanguageSlug
  userId: string
  title: string
}

type FetchConversationsUseCaseResponse = Either<
  null,
  {
    conversations: ConversationResult[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchConversationsUseCase {
  constructor(private conversationsRepository: ConversationsRepository) { }

  async execute({
    page,
    userId,
    perPage,
    title
  }: FetchConversationsUseCaseRequest): Promise<FetchConversationsUseCaseResponse> {
    const conversations = await this.conversationsRepository.fetchChatConversation({
      page,
      perPage,
      userId,
      title
    });

    return right({
      conversations: conversations.data,
      meta: conversations.meta
    });
  }
}
