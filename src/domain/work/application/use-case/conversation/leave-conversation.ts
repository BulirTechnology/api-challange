import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";

import { ConversationsRepository } from "../../repositories";
interface LeaveConversationUseCaseRequest {
  socketId: string
  userId: string
}

type LeaveConversationUseCaseResponse = Either<
  null,
  null
>

@Injectable()
export class LeaveConversationUseCase {
  constructor(private conversationsRepository: ConversationsRepository) { }

  async execute({
    socketId,
    userId
  }: LeaveConversationUseCaseRequest): Promise<LeaveConversationUseCaseResponse> {
    await this.conversationsRepository.leaveConversation({
      socketId,
      userId
    });

    return right(null);
  }
}
