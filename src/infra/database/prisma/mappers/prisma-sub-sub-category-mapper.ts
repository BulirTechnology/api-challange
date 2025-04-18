import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { SubSubCategory } from "@/domain/work/enterprise/sub-sub-category";
import { SubSubCategory as PrismaSubSubCategory } from "@prisma/client";

export class PrismaSubSubCategoryMapper {
  static toDomain(info: PrismaSubSubCategory, language?: "en" | "pt"): SubSubCategory {
    return SubSubCategory.create({
      title: language === "en" ? info.titleEn : info.title,
      titleEn: info.titleEn,
      url: info.url,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      subCategoryId: new UniqueEntityID(info.subCategoryId)
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(category: SubSubCategory): PrismaSubSubCategory {
    return {
      id: category.id.toString(),
      subCategoryId: category.subCategoryId.toString(),
      title: category.title,
      titleEn: category.titleEn,
      url: category.url,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}