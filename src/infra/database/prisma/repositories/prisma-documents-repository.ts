import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { DocumentRepository } from "@/domain/users/application/repositories/documents-repository";
import { Document } from "@/domain/users/enterprise/document";
import { PrismaDocumentMapper } from "../mappers/prisma-document-mapper";

@Injectable()
export class PrismaDocumentsRepository implements DocumentRepository {
  constructor(private prisma: PrismaService) { }
  async findByUserIdAndType(serviceProviderId: string, type: "NIF" | "BI_FRONT" | "BI_BACK"): Promise<Document | null> {
    const document = await this.prisma.documents.findFirst({
      where: {
        serviceProviderId,
        type
      }
    });

    if (!document) return null;

    return PrismaDocumentMapper.toDomain(document);
  }
  async create(document: Document): Promise<void> {
    await this.prisma.documents.create({
      data: {
        title: document.title,
        type: document.type,
        url: document.url,
        serviceProviderId: document.serviceProviderId.toString()
      }
    });
  }
  
}