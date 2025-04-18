import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Service } from "@/domain/work/enterprise/service";
import { Services as PrismaService } from "@prisma/client";

export class PrismaServiceMapper {
  static toDomain(info: PrismaService, language?: "en" | "pt"): Service {
    return Service.create({
      title: language === "en" ? info.titleEn : info.title,
      titleEn: info.titleEn,
      parentId: new UniqueEntityID(info.subSubCategoryId),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(service: Service): PrismaService {
    return {
      id: service.id.toString(),
      subSubCategoryId: service.parentId.toString(),
      title: service.title,
      titleEn: service.titleEn,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}