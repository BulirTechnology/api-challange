import {
  OnModuleInit,
  UnauthorizedException
} from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import {
  Server,
  Socket
} from "socket.io";
import { jwtDecode } from "jwt-decode";

import { SaveMessageUseCase } from "@/domain/work/application/use-case/conversation/save-message";
import { UpdateUserOnlineStateUseCase } from "@/domain/users/application/use-cases/user/update-user-online-state";
import { UpdateUserSocketUseCase } from "@/domain/users/application/use-cases/user/socket/update-user-socket";
import { Quotation } from "@/domain/work/enterprise/quotation";
import { QuotationPresenter } from "../http/presenters/quotation-presenter";
import { EnvService } from "../environment/env.service";

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer() server: Server = new Server();
  private clients: Map<string, Socket> = new Map();
  private onlineUsers: Set<string> = new Set();

  constructor(
    private env: EnvService,
    private saveMessageUseCase: SaveMessageUseCase,
    private updateUserOnlineState: UpdateUserOnlineStateUseCase,
    private updateUserSocketUseCase: UpdateUserSocketUseCase
  ) { }

  onModuleInit() {
    console.log("init");
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(" ")[1];
      if (!token) {
        throw new UnauthorizedException();
      }

      const decodedToken: {
        sub: string,
        iat: number,
        exp: number
      } = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        return false;
      }

      await this.updateUserSocketUseCase.execute({
        socketId: client.id,
        userId: decodedToken.sub
      });
      this.clients.set(client.id, client);
    } catch (error) {
      console.log("deu erro ao tentar conectar: ", error)
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    client.disconnect();
  }

  @SubscribeMessage("joinConversation")
  async joinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(conversationId);
  }

  @SubscribeMessage("leaveConversation")
  async leaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(conversationId);
  }

  @SubscribeMessage("joinChat")
  async joinChat(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(userId);
  }

  @SubscribeMessage("leaveChat")
  async leaveChat(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(userId);
  }

  @SubscribeMessage("sendNewMessage")
  async sendNewMessage(
    @MessageBody() data: {
      conversationId: string,
      content: string
      sendedAt: Date
      sendById: string
      id: string
    }
  ) {
    this.server.to(data.conversationId).emit("sendNewMessage", data);
    this.server.to(data.sendById).emit("newChat", data);

    await this.saveMessageUseCase.execute({
      content: data.content,
      conversationId: data.conversationId,
      userId: data.sendById
    });
  }

  @SubscribeMessage("isTyping")
  async isTyping(
    @MessageBody() data: {
      conversationId: string
      userId: string
    },
    @ConnectedSocket() client: Socket
  ) {
    client.to(data.conversationId).emit("userTyping", {
      userId: data.userId
    });
  }

  @SubscribeMessage("stopTyping")
  async stopTyping(
    @MessageBody() data: {
      conversationId: string
      userId: string
    },
    @ConnectedSocket() client: Socket
  ) {
    client.to(data.conversationId).emit("userStopped", {
      userId: data.userId
    });
  }

  @SubscribeMessage("userOnline")
  async userOnline(
    @MessageBody() data: {
      userId: string
    },
    @ConnectedSocket() client: Socket
  ) {
    try {
      await this.updateUserOnlineState.execute({
        userId: data.userId,
        onlineState: true
      });

      client.emit("userOnline", {
        userId: data.userId,
        online: true
      });
    } catch (err) {
      console.log("deu error");
    }
  }

  /**
   * Jobs when service provider send a quotation
   */
  async notifyClientSpSendNewQuotation(params: {
    jobId: string
    quotation: Quotation,
    totalPendingQuotations: number
    socketId: string,
  }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("SpSendNewQuotation", {
        jobId: params.jobId,
        quotation: QuotationPresenter.toHTTP(params.quotation, this.env.get("STORAGE_URL")),
        totalPendingQuotations: params.totalPendingQuotations
      });
    }
  }

  async notifySpClientRejectQuotation(params: { quotationId: string, socketId: string }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("ClientRejectQuotation", {
        quotationId: params.quotationId
      });
    }
  }

  async notifySpClientAcceptedQuotation(params: { quotationId: string, socketId: string }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("ClientAcceptedQuotation", {
        quotationId: params.quotationId
      });
    }
  }

  /* notification sp to client */
  async notifyClientSpWantToStartBooking(params: {
    bookingId: string,
    socketId: string
    totalRequestToStart: number
    totalRequestToFinish: number
  }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("SpWantToStartBooking", {
        bookingId: params.bookingId,
        totalRequestToStart: params.totalRequestToStart,
        totalRequestToFinish: params.totalRequestToFinish,
      });
    }
  }

  async notifyClientSpWantToFinishBooking(params: {
    bookingId: string,
    totalRequestToStart: number
    totalRequestToFinish: number
    socketId: string
  }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("SpWantToFinishBooking", {
        bookingId: params.bookingId,
        totalRequestToStart: params.totalRequestToStart,
        totalRequestToFinish: params.totalRequestToFinish,
      });
    }
  }

  /* notification client to sp */
  async notifySpClientDenieStartBooking(params: { bookingId: string, socketId: string }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("ClientDenieStartBooking", {
        bookingId: params.bookingId
      });
    }
  }

  async notifySpClientAcceptStartBooking(params: { bookingId: string, socketId: string }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("ClientAcceptStartBooking", {
        bookingId: params.bookingId
      });
    }
  }

  async notifySpClientDenieFinishBooking(params: { bookingId: string, socketId: string }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("ClientDenieFinishBooking", {
        bookingId: params.bookingId
      });
    }
  }

  async notifySpClientAcceptFinishBooking(params: { bookingId: string, socketId: string }) {
    const client = this.clients.get(params.socketId);

    if (client) {
      client.emit("ClientAcceptFinishBooking", {
        bookingId: params.bookingId
      });
    }
  }
}