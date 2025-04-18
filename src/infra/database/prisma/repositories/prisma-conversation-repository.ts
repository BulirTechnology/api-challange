import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { ConversationsRepository } from "@/domain/work/application/repositories/conversation-repository";
import { ConversationPaginationParams } from "@/domain/work/application/params/conversation-params";
import { Conversation, ConversationResult } from "@/domain/work/enterprise/conversation";
import { PrismaConversationMapper } from "../mappers/prisma-conversation-mapper";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import {
  Prisma,
  Job,
  Booking as PrismaBooking,
  Conversation as PrismaConversation
} from "@prisma/client";
import { Pagination } from "@/core/repositories/pagination-params";
import { formatDate } from "@/helpers/date";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AccountType } from "@/domain/users/enterprise";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

type BookingProp = PrismaBooking & {
  job: Job
  conversation: PrismaConversation
}

@Injectable()
export class PrismaConversationsRepository implements ConversationsRepository {
  constructor(private prisma: PrismaService) { }
  async findByBookingId(bookingId: string): Promise<Conversation | null> {
    const respo = await this.prisma.conversation.findFirst({
      where: {
        bookingId
      }
    })

    return PrismaConversationMapper.toDomain(respo!)
  }

  async countUnreadedMessages(params: { userId: string }): Promise<number> {
    const total = await this.prisma.conversation.count({
      where: {
        booking: {
          job: {
            client: {
              userId: params.userId
            }
          },
        },
        messages: {
          some: {
            AND: [
              {
                readed: false,
              },
              {
                sendById: {
                  not: params.userId
                }
              }
            ]
          }
        }
      }
    })

    return total
  }
  async fetchChatConversation(params: { userId: string, page: number, perPage: number, title: string }): Promise<Pagination<ConversationResult>> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: params.userId
      },
      select: {
        accountType: true
      }
    });
    console.log("user: ", user)
    if (!user) return {
      data: [],
      meta: {
        currentPage: 0,
        lastPage: 0,
        next: 0,
        perPage: 0,
        prev: 0,
        total: 0
      }
    }

    let accountType: AccountType = user.accountType,
      profileId: string;

    if (accountType === "Client") {
      const client = await this.prisma.client.findFirst({
        where: {
          userId: params.userId
        }
      });
      profileId = client?.id!
    } else {
      const serviceProvider = await this.prisma.serviceProvider.findFirst({
        where: {
          userId: params.userId
        }
      });

      profileId = serviceProvider?.id!
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        clientId: accountType === "Client" ? profileId : {},
        serviceProviderId: accountType === "ServiceProvider" ? profileId : {},
        job: params.title ? {
          title: {
            contains: params.title
          }
        } : {}
      },
      include: {
        job: true
      }
    });

    const ids = bookings.map(item => { return item.id; });

    const skip = (params.page - 1) * params.perPage;
    const take = params.perPage;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        bookingId: {
          in: ids
        }
      },
      include: {
        booking: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            serviceProvider: {
              include: {
                user: true
              }
            },
            job: true
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take,
      skip,
    });


    const result: ConversationResult[] = [];

    for (const element of conversations) {
      const totalUnreadMessage = await this.prisma.message.count({
        where: {
          readed: false,
          sendById: {
            not: params.userId
          },
          conversationId: element.id
        }
      });

      let createdAt = element.createdAt;
      if (element.messages.length > 0) {
        createdAt = element.messages[0].createdAt;
      }

      result.push({
        createdAt,
        id: element.id,
        title: `${element.booking?.job.title}`,
        lastMessage: element.messages.length > 0 ? element.messages[0].content : "Sem mensagem",

        name: accountType === "Client" ?
          `${element.booking?.serviceProvider.firstName} ${element.booking?.serviceProvider.lastName}`
          :
          `${element.booking?.client.firstName} ${element.booking?.serviceProvider.lastName}`,
        profileUrl: accountType === "Client" ?
          `${element.booking?.serviceProvider.user.profileUrl}`
          :
          `${element.booking?.client.user.profileUrl}`,
        time: formatDate(createdAt, "pt"),
        bookingId: new UniqueEntityID(element.bookingId),
        isBookingCompleted: element.booking?.state === "COMPLETED",
        totalUnreadMessage,
        updatedAt: new Date(),
        clientId: element.booking?.clientId + "",
        serviceProviderId: element.booking?.serviceProviderId + ""
      });
    }
    const totalRecords = await this.prisma.conversation.count();

    const totalPages = Math.ceil(totalRecords / params.perPage);

    const pagination = {
      currentPage: params.page,
      lastPage: totalPages,
      next: params.page < totalPages ? params.page + 1 : null,
      perPage: params.perPage,
      prev: params.page > 1 ? params.page - 1 : null,
      total: totalRecords,
    };

    return {
      data: result,
      meta: pagination
    };
  }
  async fetchConversationsForUser(params: { userId: string, page: number }): Promise<Pagination<Conversation>> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: params.userId
      }
    });

    if (user?.accountType === "Client") {
      const client = await this.prisma.client.findFirst({
        where: {
          userId: params.userId
        }
      });

      const result = await this.fetchClientConversation({
        page: params.page,
        clientId: client?.id
      });
      return {
        data: result,
        meta: {
          currentPage: 1,
          lastPage: 0,
          next: 0,
          perPage: 0,
          prev: 0,
          total: result.length
        }
      };
    } else {
      const serviceProvider = await this.prisma.serviceProvider.findFirst({
        where: {
          userId: params.userId
        }
      });

      const result = await this.fetchServiceProviderConversation({
        page: params.page,
        serviceProviderId: serviceProvider?.id
      });

      return {
        data: result,
        meta: {
          currentPage: 1,
          lastPage: 0,
          next: 0,
          perPage: 0,
          prev: 0,
          total: result.length
        }
      };
    }
  }
  async leaveConversation(params: { socketId: string; userId: string; }): Promise<void> {
    await this.prisma.activeConversation.delete({
      where: {
        socketId: params.socketId,
      }
    });
  }
  private async fetchClientConversation(params: ConversationPaginationParams): Promise<Conversation[]> {
    const page = params.page;

    const bookings = await this.paginateBooking({
      where: {
        OR: [
          {
            clientId: params.clientId
          },
        ]
      },
      include: {
        conversation: true
      },
      page,
      perPage: params.perPage
    });

    return bookings.data.map(item => PrismaConversationMapper.toDomain({
      bookingId: item.id,
      id: item.conversation?.id + "",
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
  private async fetchServiceProviderConversation(params: ConversationPaginationParams): Promise<Conversation[]> {
    const page = params.page;

    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          {
            clientId: params.clientId
          },
        ]
      },
      include: {
        conversation: true
      },
      take: 20,
      skip: (page - 1) * 20
    });

    return bookings.map(item => PrismaConversationMapper.toDomain({
      bookingId: item.id,
      id: item.conversation?.id + "",
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
  async create(conversation: Conversation): Promise<void> {
    const data = PrismaConversationMapper.toPrisma(conversation);

    const ConversationResult = await this.prisma.conversation.findFirst({
      where: {
        bookingId: data.bookingId
      }
    });

    if (ConversationResult) return;

    await this.prisma.conversation.create({
      data: {
        bookingId: data.bookingId
      }
    });
  }
  async joinConversation(params: {
    conversationId: string,
    socketId: string,
  }): Promise<void> {
    await this.prisma.activeConversation.create({
      data: {
        conversationId: params.conversationId,
        socketId: params.socketId,
        userId: ""
      }
    });
  }
  async paginateConversations({ where, orderBy, page, perPage, include }: {
    where?: Prisma.ConversationWhereInput,
    orderBy?: Prisma.ConversationOrderByWithRelationInput,
    include?: Prisma.ConversationInclude,
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaConversation>> {
    return paginate(
      this.prisma.conversation,
      {
        where,
        orderBy,
        include
      },
      {
        page,
        perPage,
      },
    );
  }
  async paginateBooking({ where, orderBy, page, perPage, include }: {
    where?: Prisma.BookingWhereInput,
    orderBy?: Prisma.BookingOrderByWithRelationInput,
    include?: Prisma.BookingInclude,
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<BookingProp>> {
    return paginate(
      this.prisma.booking,
      {
        where,
        orderBy,
        include
      },
      {
        page,
        perPage,
      },
    );
  }

}