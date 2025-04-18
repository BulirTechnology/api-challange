import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Category } from "@/domain/work/enterprise/category";
import { Category as PrismaCategory } from "@prisma/client";

export class PrismaCategoryMapper {
  static toDomain(info: PrismaCategory, language: "en" | "pt"): Category {
    return Category.create({
      title: language === "en" ? info.titleEn : info.title,
      titleEn: info.titleEn,
      url: info.url,
      priority: info.priority,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(category: Category): PrismaCategory {
    return {
      id: category.id.toString(),
      title: category.title,
      titleEn: category.titleEn,
      url: category.url,
      priority: category.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}