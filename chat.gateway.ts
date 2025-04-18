import { OnModuleInit, UseGuards } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { JwtAuthGuard } from "./src/infra/auth/jwt-auth.guard";
import { AuthenticatedUser } from "./src/infra/auth/authenticated-user-decorator";
import { AuthPayload } from "./src/infra/auth/jwt.strategy";
import { MessageProps } from "@/domain/work/enterprise/message";
import { FetchConversationsUseCase } from "@/domain/work/application/use-case/conversation/fetch-conversations";
import { JoinConversationUseCase } from "@/domain/work/application/use-case/conversation/join-conversation";
import { SaveMessageUseCase } from "@/domain/work/application/use-case/conversation/save-message";
import { ActiveConversation } from "@/domain/work/enterprise/active-conversation";
import { LeaveConversationUseCase } from "@/domain/work/application/use-case/conversation/leave-conversation";
import { FetchMessagesUseCase } from "@/domain/work/application/use-case/conversation/fetch-messages";

@WebSocketGateway({ cors: { origin: ["*"] } })
export class ChatGateway
implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  constructor(
    private fetchConversationsUseCase: FetchConversationsUseCase,
    private joinConversationUseCase: JoinConversationUseCase,
    private saveMessageUseCase: SaveMessageUseCase,
    private leaveConversationUseCase: LeaveConversationUseCase,
    private fetchMessagesUseCase: FetchMessagesUseCase
  ) { }

  // Note: Runs when server starts - Remove in production
  onModuleInit() {
    console.log("init");
  }

  @WebSocketServer() server: Server = new Server();

  @UseGuards(JwtAuthGuard)
  handleConnection(
    socket: Socket,
    @AuthenticatedUser() user: AuthPayload,
  ) {
    console.log("HANDLE CONNECTION: ", user);
    //const jwt = socket.handshake.headers.authorization || null;

    if (!user) {
      console.log("No USER");
      this.handleDisconnect(socket);
    } else {
      socket.data.user = user;
      this.getConversations(socket, user.sub);
    }

  }

  async getConversations(socket: Socket, userId: string): Promise<void> {
    const conversations = await this.fetchConversationsUseCase.execute({
      page: 1,
      userId,
      language: "pt",
      title: ""
    });
    this.server.to(socket.id).emit("conversations", conversations);
  }

  async handleDisconnect(socket: Socket) {
    console.log("HANDLE DISCONNECT: ");
    await this.leaveConversationUseCase.execute({
      socketId: socket.id,
      userId: ""
    });
  }

  @SubscribeMessage("createConversation")
  async createConversation(socket: Socket, conversationId: string) {
    await this.joinConversationUseCase.execute({
      conversationId,
      socketId: socket.id,
      userId: socket.data.user.id
    });
  }

  @SubscribeMessage("sendMessage")
  handleMessage(socket: Socket, newMessage: MessageProps) {
    if (!newMessage.conversationId) return [];

    const { user } = socket.data;

    const activeConversations: ActiveConversation[] = [];

    this.saveMessageUseCase.execute({
      content: newMessage.content,
      conversationId: newMessage.conversationId.toString(),
      userId: user.id
    });

    for(const active of activeConversations) {
      this.server
        .to(active.socketId)
        .emit("newMessage", newMessage);
    }
  }

  @SubscribeMessage("joinConversation")
  async joinConversation(socket: Socket, friendId: string) {
    console.log(friendId);
    await this.joinConversationUseCase.execute({
      conversationId: "",
      socketId: "",
      userId: ""
    });

    const messages = await this.fetchMessagesUseCase.execute({
      conversationId:"",
      page: 1,
      userId: ""
    });

    this.server.to(socket.id).emit("messages", messages);
  }

  @SubscribeMessage("leaveConversation")
  async leaveConversation(socket: Socket) {
    await this.leaveConversationUseCase.execute({
      socketId: socket.id,
      userId: ""
    });
  }
}