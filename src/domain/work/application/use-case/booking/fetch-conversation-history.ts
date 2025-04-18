import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Message } from "@/domain/work/enterprise";
import { ConversationsRepository, MessagesRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface FetchConversationHistoryReasonUseCaseRequest {
  language: LanguageSlug
  page: number,
  perPage?: number
  userId: string,
  bookingId: string
  title: string
}

type FetchConversationHistoryReasonUseCaseResponse = Either<
  null,
  {
    data: Message[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchConversationHistoryReasonUseCase {
  constructor(
    private conversationsRepository: ConversationsRepository,
    private messagesRepository: MessagesRepository) { }

  async execute({
    page,
    perPage,
    title,
    userId,
    bookingId
  }: FetchConversationHistoryReasonUseCaseRequest): Promise<FetchConversationHistoryReasonUseCaseResponse> {
    const conversation = await this.conversationsRepository.findByBookingId(bookingId)
    const data = await this.messagesRepository.findByConversationId({
      perPage,
      page,
      title,
      userId,
      conversationId: conversation!.id.toString()
    });

    return right({
      data: data.data,
      meta: data.meta
    });
  }
}
