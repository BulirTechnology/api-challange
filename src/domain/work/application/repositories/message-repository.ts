import { Pagination } from "@/core/repositories/pagination-params";
import { Message } from "../../enterprise/message";
import { MessagePaginationParams } from "../params/message.params";

export abstract class MessagesRepository {
  abstract findByConversationId(params: MessagePaginationParams): Promise<Pagination<Message>>
  abstract create(message: Message): Promise<Message>
}
 