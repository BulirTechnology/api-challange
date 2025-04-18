import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FileDispute } from "@/domain/work/enterprise/file-dispute";
import { FileDispute as PrismaFileDispute } from "@prisma/client";

export class PrismaFileDisputeMapper {
  static toDomain(info: PrismaFileDispute & {
    fileDisputeReason: {
      id: string;
      value: string;
      valueEn: string;
    }
  }): FileDispute {
    return FileDispute.create({
      bookingId: new UniqueEntityID(info.bookingId),
      description: info.description,
      fileDisputeReason: info.fileDisputeReason.value,
      fileDisputeReasonId: new UniqueEntityID(info.fileDisputeReasonId),
      resolutionComment: info.resolutionComment,
      resolutionDate: info.resolutionDate,
      status: info.status,
      userId: new UniqueEntityID(info.userId),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(fileDispute: FileDispute): PrismaFileDispute {
    return {
      id: fileDispute.id.toString(),
      bookingId: fileDispute.bookingId.toString(),
      createdAt: fileDispute.createdAt,
      description: fileDispute.description,
      fileDisputeReasonId: fileDispute.fileDisputeReasonId.toString(),
      resolutionComment: fileDispute.resolutionComment,
      resolutionDate: fileDispute.resolutionDate,
      status: fileDispute.status,
      updatedAt: fileDispute.updatedAt ? fileDispute.updatedAt : new Date(),
      userId: fileDispute.userId.toString()
    };
  }
}