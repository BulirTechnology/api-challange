import { Injectable } from "@nestjs/common";
import {
  Prisma,
  Message as PrismaMessage
} from "@prisma/client";
import {
  PaginatorTypes,
  paginator
} from "@nodeteam/nestjs-prisma-pagination";

import { MessagesRepository } from "@/domain/work/application/repositories/message-repository";
import { MessagePaginationParams } from "@/domain/work/application/params/message.params";
import { Message } from "@/domain/work/enterprise/message";

import { Pagination } from "@/core/repositories/pagination-params";

import { PrismaService } from "../prisma.service";
import { PrismaMessageMapper } from "../mappers/prisma-message-mapper";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaMessagesRepository implements MessagesRepository {
  constructor(private prisma: PrismaService) { }

  async findByConversationId(params: MessagePaginationParams): Promise<Pagination<Message>> {
    await this.prisma.message.updateMany({
      where: {
        conversationId: params.conversationId,
        sendById: {
          not: params.userId,
        }
      },
      data: {
        readed: true
      }
    })

    const data = await this.paginate({
      where: {
        conversationId: params.conversationId,
      }
    });

    return {
      data: data.data.map(PrismaMessageMapper.toDomain),
      meta: data.meta
    };
  }

  async create(message: Message): Promise<Message> {
    const data = PrismaMessageMapper.toPrisma(message);

    const messageCreated = await this.prisma.message.create({
      data: {
        content: message.content,
        conversationId: message.conversationId.toString(),
        sendById: message.sendById.toString(),
        readed: false,
      }
    });

    return PrismaMessageMapper.toDomain(messageCreated);
  }

  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.MessageWhereInput,
    orderBy?: Prisma.MessageOrderByWithRelationInput | Prisma.MessageOrderByWithRelationInput[],
    page?: number,
    perPage?: number,
    include?: Prisma.MessageInclude
  }): Promise<PaginatorTypes.PaginatedResult<PrismaMessage>> {
    return paginate(
      this.prisma.message,
      {
        where,
        orderBy,
      },
      {
        page,
        perPage,
      },
    );
  }

}