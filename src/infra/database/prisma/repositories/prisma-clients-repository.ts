import { ClientsRepository } from "@/domain/users/application/repositories/client-repository";
import { Client } from "@/domain/users/enterprise/client";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import {
  PrismaClientMapper,
  PrismaClientTypeMapper,
} from "../mappers/prisma-client-mapper";
import { Pagination } from "@/core/repositories/pagination-params";
import { Prisma } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(params: {
    page: number;
    name: string;
    perPage?: number;
  }): Promise<Pagination<Client>> {
    const clients = await this.paginate({
      where: {
        OR: params.name
          ? [
              {
                firstName: {
                  contains: params.name,
                },
              },
              {
                lastName: {
                  contains: params.name,
                },
              },
            ]
          : [],
      },
      include: {
        user: true,
      },
    });

    return {
      data: clients.data.map((item) =>
        PrismaClientMapper.toDomain({
          bornAt: item.bornAt,
          createdAt: item.createdAt,
          firstName: item.firstName,
          gender: item.gender,
          id: item.id,
          lastName: item.lastName,
          updatedAt: item.updatedAt,
          userId: item.userId,
          user: item.user,
        })
      ),
      meta: clients.meta,
    };
  }
  async findByPhoneNumber(phoneNumber: string): Promise<Client | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        phoneNumber,
        accountType: "Client",
      },
      include: {
        client: true,
      },
    });

    if (!user || !user.client) return null;

    return PrismaClientMapper.toDomain({
      bornAt: user.client.bornAt,
      createdAt: user.client.createdAt,
      firstName: user.client.firstName,
      gender: user.client.gender,
      id: user.client.id,
      lastName: user.client.lastName,
      updatedAt: user.client.updatedAt,
      userId: user.client.userId,
      user: {
        email: user.email,
        isEmailValidated: user.isEmailValidated,
        isPhoneNumberValidated: user.isPhoneNumberValidated,
        phoneNumber: user.phoneNumber,
        state: user.state,
      },
    });
  }
  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!client) {
      return null;
    }

    return PrismaClientMapper.toDomain({
      bornAt: client.bornAt,
      createdAt: client.createdAt,
      firstName: client.firstName,
      gender: client.gender,
      id: client.id,
      lastName: client.lastName,
      updatedAt: client.updatedAt,
      userId: client.userId,
      user: {
        email: client.user.email,
        isEmailValidated: client.user.isEmailValidated,
        isPhoneNumberValidated: client.user.isPhoneNumberValidated,
        phoneNumber: client.user.phoneNumber,
        state: client.user.state,
      },
    });
  }
  async findNewQuotations(params: {
    clientId: string;
    jobId: string;
  }): Promise<number> {
    const totalNewQuotations = await this.prisma.quotation.count({
      where: {
        readByClient: false,
        jobId: params.jobId,
      },
    });

    return totalNewQuotations;
  }
  async update(clientId: string, client: Client): Promise<void> {
    const data = PrismaClientMapper.toPrisma(client);

    await this.prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
        bornAt: data.bornAt ? new Date(data.bornAt.toString()) : null,
        firstName: data.firstName,
        gender: data.gender,
        lastName: data.lastName,
      },
    });
  }
  async create(client: Client): Promise<Client> {
    const data = PrismaClientMapper.toPrisma(client);

    const result = await this.prisma.client.create({
      data: {
        bornAt: data.bornAt ? new Date(data.bornAt.toString()) : null,
        firstName: data.firstName,
        gender: data.gender,
        lastName: data.lastName,
        userId: data.userId,
      },
      include: {
        user: true,
      },
    });

    return PrismaClientMapper.toDomain({
      bornAt: result.bornAt,
      createdAt: result.createdAt,
      firstName: result.firstName,
      gender: result.gender,
      id: result.id,
      lastName: result.lastName,
      updatedAt: result.updatedAt,
      userId: result.userId,
      user: {
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        state: result.user.state,
        isEmailValidated: result.user.isEmailValidated,
        isPhoneNumberValidated: result.user.isPhoneNumberValidated,
      },
    });
  }
  async findByEmail(email: string): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        user: {
          email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!client) {
      return null;
    }

    return PrismaClientMapper.toDomain({
      bornAt: client.bornAt,
      createdAt: client.createdAt,
      firstName: client.firstName,
      gender: client.gender,
      id: client.id,
      lastName: client.lastName,
      updatedAt: client.updatedAt,
      userId: client.userId,
      user: {
        email: client.user.email,
        phoneNumber: client.user.phoneNumber,
        state: client.user.state,
        isEmailValidated: client.user.isEmailValidated,
        isPhoneNumberValidated: client.user.isPhoneNumberValidated,
      },
    });
  }
  async paginate({
    where,
    orderBy,
    page,
    perPage,
    include,
  }: {
    where?: Prisma.ClientWhereInput;
    orderBy?: Prisma.ClientOrderByWithRelationInput;
    include?: Prisma.ClientInclude;
    page?: number;
    perPage?: number;
  }): Promise<PaginatorTypes.PaginatedResult<PrismaClientTypeMapper>> {
    return paginate(
      this.prisma.client,
      {
        where,
        orderBy,
        include,
      },
      {
        page,
        perPage,
      }
    );
  }
}
