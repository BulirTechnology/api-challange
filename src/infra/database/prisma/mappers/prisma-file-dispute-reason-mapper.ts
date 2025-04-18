import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FileDisputeReason } from "@/domain/work/enterprise/file-dispute-reason";
import { FileDisputeReason as PrismaFileDisputeReason } from "@prisma/client";

export class PrismaFileDisputeReasonMapper {
  static toDomain(dispute: PrismaFileDisputeReason, language: "en" | "pt"): FileDisputeReason {
    return FileDisputeReason.create({
      value: language === "en" ? dispute.valueEn : dispute.value,
      valueEn: dispute.valueEn
    }, new UniqueEntityID(dispute.id));
  }

  static toPrisma(dispute: FileDisputeReason): PrismaFileDisputeReason {
    return {
      id: dispute.id.toString(),
      value: dispute.value,
      valueEn: dispute.valueEn
    };
  }
}