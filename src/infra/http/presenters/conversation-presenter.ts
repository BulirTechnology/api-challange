import { ConversationResult } from "@/domain/work/enterprise/conversation";

export class ConversationPresenter {
  static toHTTP(conversation: ConversationResult, storageUrl: string) {
    return {
      id: conversation.id.toString(),
      title: conversation.title,
      last_message: conversation.lastMessage,
      user_name: conversation.name,
      booking_id: conversation.bookingId.toString(),
      user_profile_url: conversation.profileUrl && conversation.profileUrl != "null" ? storageUrl + conversation.profileUrl : null,
      send_at: conversation.time,
      is_booking_completed: conversation.isBookingCompleted,
      unread_message: conversation.totalUnreadMessage,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
      client_id: conversation.clientId,
      service_provider_id: conversation.serviceProviderId
    };
  }
} 