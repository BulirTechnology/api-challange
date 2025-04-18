import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { FetchConversationsUseCase } from "@/domain/work/application/use-case/conversation/fetch-conversations";
import { DatabaseModule } from "../database/database.module";
import { JoinConversationUseCase } from "@/domain/work/application/use-case/conversation/join-conversation";
import { SaveMessageUseCase } from "@/domain/work/application/use-case/conversation/save-message";
import { LeaveConversationUseCase } from "@/domain/work/application/use-case/conversation/leave-conversation";
import { FetchMessagesUseCase } from "@/domain/work/application/use-case/conversation/fetch-messages";
import { UpdateUserOnlineStateUseCase } from "@/domain/users/application/use-cases/user/update-user-online-state";
import { UpdateUserSocketUseCase } from "@/domain/users/application/use-cases/user/socket/update-user-socket";
import { EnvModule } from "../environment/env.module";

@Module({
  imports: [
    DatabaseModule,
    EnvModule,
  ],
  providers: [
    FetchConversationsUseCase,
    JoinConversationUseCase,
    SaveMessageUseCase,
    LeaveConversationUseCase,
    FetchMessagesUseCase,
    UpdateUserOnlineStateUseCase,
    UpdateUserSocketUseCase,
    SocketGateway
  ],
  exports: [
    SocketGateway
  ]
})
export class WebsocketModule { }
