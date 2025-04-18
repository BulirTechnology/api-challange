import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Document } from "@/domain/users/enterprise/document";
import { Documents as PrismaDocument } from "@prisma/client";

export class PrismaDocumentMapper {
  static toDomain(info: PrismaDocument): Document {
    return Document.create({
      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
      title: info.title,
      type: info.type,
      url: info.url,
      createdAt: info.createdAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(document: Document): PrismaDocument {
    return {
      createdAt: document.createdAt,
      id: document.id.toString(),
      serviceProviderId: document.serviceProviderId.toString(),
      title: document.title,
      type: document.type,
      updatedAt: document.createdAt,
      url: document.url
    };
  }
}