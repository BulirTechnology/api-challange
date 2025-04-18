import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { JobCancelReason } from "@/domain/work/enterprise/job-cancel-reason";
import { JobCancelReason as PrismaJobCancelReason } from "@prisma/client";

export class PrismaJobCancelReasonMapper {
  static toDomain(info: PrismaJobCancelReason, language: "en" | "pt"): JobCancelReason {
    return JobCancelReason.create({
      value: language === "en" ? info.valueEn : info.value,
      valueEn: info.valueEn,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(info: JobCancelReason): PrismaJobCancelReason {
    return {
      id: info.id.toString(),
      value: info.value,
      valueEn: info.valueEn
    };
  }
}