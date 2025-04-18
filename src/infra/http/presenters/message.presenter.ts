import { Message } from "@/domain/work/enterprise/message";

export class MessagePresenter {
  static toHTTP(message: Message) {
    return {
      id: message.id.toString(),
      description: message.content,
      send_by_id: message.sendById.toString(),
      created_at: message.createdAt,
      updated_at: message.updatedAt
    };
  }
}