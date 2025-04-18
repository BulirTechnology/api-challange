import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { FileDisputeRepository } from "@/domain/work/application/repositories/file-dispute-repository";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { FileDispute } from "@/domain/work/enterprise/file-dispute";
import { PrismaFileDisputeMapper } from "../mappers/prisma-file-dispute-mapper";

@Injectable()
export class PrismaFileDisputeRepository implements FileDisputeRepository {
  constructor(private prisma: PrismaService) { }

  async findByBookingId(bookingId: string): Promise<FileDispute | null> {
    const data = await this.prisma.fileDispute.findFirst({
      where: {
        bookingId
      },
      include: {
        fileDisputeReason: true
      }
    });

    if (!data) return null;

    return PrismaFileDisputeMapper.toDomain(data);
  }
  async findMany(params: PaginationParams): Promise<FileDispute[]> {
    const page = params.page;

    const list = await this.prisma.fileDispute.findMany({
      include: {
        fileDisputeReason: true
      },
      take: 20,
      skip: (page - 1) * 20,
    });

    return list.map(PrismaFileDisputeMapper.toDomain);
  }
  async findById(id: string): Promise<FileDispute | null> {
    const response = await this.prisma.fileDispute.findUnique({
      where: {
        id
      },
      include: {
        fileDisputeReason: true
      }
    });

    if (!response) return null;

    return PrismaFileDisputeMapper.toDomain(response);
  }
  async create(reason: FileDispute): Promise<void> {
    const data = PrismaFileDisputeMapper.toPrisma(reason);

    const file = await this.prisma.fileDispute.findFirst({
      where: {
        bookingId: data.bookingId
      }
    });

    if (!file) {
      await this.prisma.fileDispute.create({
        data: {
          description: data.description,
          status: data.status,
          bookingId: data.bookingId,
          fileDisputeReasonId: data.fileDisputeReasonId,
          userId: data.userId,
          createdAt: data.createdAt,
          resolutionComment: data.resolutionComment,
          resolutionDate: data.resolutionDate,
        }
      });
    }
  }


}