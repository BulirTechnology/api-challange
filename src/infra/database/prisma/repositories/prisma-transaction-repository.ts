import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { TransactionRepository } from "@/domain/payment/application/repositories/transaction-repository";
import { TransactionPaginationParams } from "@/domain/payment/application/params/transaction-params";
import { Transaction } from "@/domain/payment/enterprise/transaction";
import { PrismaTransactionMapper } from "../mappers/prisma-transaction-mapper";
import { Prisma, Transaction as PrismaTransaction } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { Pagination } from "@/core/repositories/pagination-params";
import { LanguageSlug } from "@/domain/users/enterprise";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private prisma: PrismaService) { }

  async countTransactionInComingAmount(params: { month: number; year: number; walletId: string; }): Promise<number> {
    const startDate = new Date(params.year, params.month - 1, 1);
    const endDate = new Date(params.year, params.month, 0, 23, 59, 59);

    const result = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        walletId: params.walletId,
        type: {
          in: ["ServicePayment", "ServiceSalary",]
        },
        status: "Completed",
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
    });

    return result._sum.amount || 0;
  }

  async findMany(params: TransactionPaginationParams): Promise<Pagination<Transaction>> {
    const page = params.page ? params.page : 1;
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId: params.userId,
      }
    });

    if (!wallet) return {
      data: [],
      meta: {
        currentPage: 1,
        lastPage: 0,
        next: 0,
        perPage: 0,
        prev: 0,
        total: 0
      }
    };

    const transactions = await this.paginate({
      where: {
        walletId: wallet?.id,
        type: params.types.length > 0 ? {
          in: params.types
        } : {}
      },
      page,
      perPage: params.perPage,
      orderBy: {
        createdAt: "desc"
      }
    });

    return {
      data: transactions.data.map(item => PrismaTransactionMapper.toDomain(item, params.language)),
      meta: transactions.meta
    };
  }

  async findById(id: string, language: LanguageSlug): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id
      }
    });

    if (!transaction) return null;

    return PrismaTransactionMapper.toDomain(transaction, language);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const data = PrismaTransactionMapper.toPrisma(transaction);

    const itemCreated = await this.prisma.transaction.create({
      data: {
        amount: data.amount,
        description: data.description,
        descriptionEn: data.descriptionEn,
        status: data.status,
        type: data.type,
        jobId: data.jobId,
        walletId: data.walletId,
        promotionId: data.promotionId,
      }
    });

    return PrismaTransactionMapper.toDomain(itemCreated, "pt")
  }
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.TransactionWhereInput,
    orderBy?: Prisma.TransactionOrderByWithRelationInput
    page?: number,
    perPage?: number,
    include?: Prisma.TransactionInclude
  }): Promise<PaginatorTypes.PaginatedResult<PrismaTransaction>> {
    return paginate(
      this.prisma.transaction,
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