import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { SubCategory } from "@/domain/work/enterprise/sub-category";
import { SubCategory as PrismaSubCategory } from "@prisma/client";

export class PrismaSubCategoryMapper {
  static toDomain(info: PrismaSubCategory, language?: "en" | "pt"): SubCategory {
    return SubCategory.create({
      title: language === "en" ? info.titleEn : info.title,
      titleEn: info.titleEn,
      url: info.url,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      categoryId: new UniqueEntityID(info.categoryId),
      hasSubSubCategory: info.hasSubSubCategory
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(category: SubCategory): PrismaSubCategory {
    return {
      id: category.id.toString(),
      categoryId: category.categoryId.toString(),
      title: category.title,
      titleEn: category.titleEn,
      url: category.url,
      hasSubSubCategory: category.hasSubSubCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}