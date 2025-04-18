import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Specialization } from "@/domain/users/enterprise/specialization";

import {
  Prisma,
  Specialization as PrismaSpecialization,
} from "@prisma/client";

export class PrismaSpecializationMapper {
  static toDomain(info: PrismaSpecialization & {
    service: {
      title: string,
      category: { 
        id: string, 
        title: string,
        category: {
          id: string, 
          title: string,
          category: {
            id: string, 
            title: string,
            url: string
          }
        }
      }
    }
  }): Specialization {
    return Specialization.create({
      title: info.service.title,
      price: Number.parseInt(info.price.toString()),
      rate: info.rate,

      service: info.service.title,
      serviceId: new UniqueEntityID(info.serviceId + ""),

      subSubCategory: info.service.category.title,
      subSubCategoryId: new UniqueEntityID(info.service.category.id),

      subCategory: info.service.category.category.title,
      subCategoryId: new UniqueEntityID(info.service.category.id),

      category: info.service.category.category.category.title,
      categoryId: new UniqueEntityID(info.service.category.category.category.id),
      categoryUrl: info.service.category.category.category.url,

      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(specialization: Specialization): PrismaSpecialization {
    return {
      id: specialization.id.toString(),
      title: specialization.title,
      price: new Prisma.Decimal(specialization.price),
      rate: specialization.rate,
      serviceId: specialization.serviceId.toString(),
      serviceProviderId: specialization.serviceProviderId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}