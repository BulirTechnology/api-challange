import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Quotation } from "@/domain/work/enterprise/quotation";
import {
  Prisma,
  Quotation as PrismaQuotation,
} from "@prisma/client";

export class PrismaQuotationMapper {
  static toDomain(info: PrismaQuotation & {
    clientId: string
    clientName: string
    clientProfileUrl: string
    clientRating: number
    isServiceProviderFavoriteOfClient: boolean
    serviceProviderName: string
    serviceProviderProfileUrl: string
    serviceProviderRating: number
  }): Quotation {
    return Quotation.create({
      budget: (new Prisma.Decimal(info.budget)).toNumber(),
      cover: info.cover,
      date: info.date,
      state: info.status,
      readByClient: info.readByClient,
      rejectDescription: info.rejectDescription,
      rejectReasonId: info.rejectReasonId,
      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
      jobId: new UniqueEntityID(info.jobId),

      clientId: info.clientId,
      clientName: info.clientName,
      clientProfileUrl: info.clientProfileUrl,
      clientRating: info.clientRating,
      isServiceProviderFavoriteOfClient: info.isServiceProviderFavoriteOfClient,
      serviceProviderName: info.serviceProviderName,
      serviceProviderProfileUrl: info.serviceProviderProfileUrl,
      serviceProviderRating: info.serviceProviderRating,
      id: new UniqueEntityID(info.id?.toString()+''),

      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    });
  }

  static toPrisma(quotation: Quotation): PrismaQuotation {
    return {
      id: quotation.id.toString(),
      readByClient: quotation.readByClient,
      budget: new Prisma.Decimal(quotation.budget),
      cover: quotation.cover,
      serviceProviderId: quotation.serviceProviderId?.toString()+'',
      date: quotation.date,
      status: quotation.state,
      jobId: quotation.jobId.toString(),
      rejectDescription: quotation.rejectDescription + "",
      rejectReasonId: quotation.rejectReasonId ? quotation.rejectReasonId : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}