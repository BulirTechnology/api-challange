import { Pagination } from "@/core/repositories/pagination-params";
import { Conversation, ConversationResult } from "../../enterprise/conversation";

export abstract class ConversationsRepository {
  abstract fetchChatConversation(params: {
    userId: string,
    page: number,
    perPage?: number
    title: string
  }): Promise<Pagination<ConversationResult>>
  abstract findByBookingId(bookingId: string): Promise<Conversation | null>
  abstract create(conversation: Conversation): Promise<void>
  abstract countUnreadedMessages(params: { userId: string }): Promise<number>
  abstract fetchConversationsForUser(params: {
    userId: string,
    page: number,
    perPage?: number
  }): Promise<Pagination<Conversation>>
  abstract joinConversation(params: {
    conversationId: string,
    socketId: string,
  }): Promise<void>
  abstract leaveConversation(params: { socketId: string, userId: string }): Promise<void>
}
