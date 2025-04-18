import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuotationRejectReason } from "@/domain/work/enterprise/quotation-reject-reason";
import { QuotationRejectReason as PrismaQuotationRejectReason } from "@prisma/client";

export class PrismaQuotationRejectReasonMapper {
  static toDomain(info: PrismaQuotationRejectReason): QuotationRejectReason {
    return QuotationRejectReason.create({
      value: info.value,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(quotation: QuotationRejectReason): PrismaQuotationRejectReason {
    return {
      id: quotation.id.toString(),
      value: quotation.value,
    };
  }
}