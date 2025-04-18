import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ServiceProviderInquire } from "@/domain/inquire/enterprise/service-provider-inquire";

import { ServiceProviderInquire as PrismaServiceProviderInquire } from "@prisma/client";
 
export class PrismaServiceProviderInquireMapper {
  static toDomain(info: PrismaServiceProviderInquire): ServiceProviderInquire {
    return ServiceProviderInquire.create({
      ageGroup: info.ageGroup,
      city: info.city,
      emailOrNumber: info.emailOrNumber,
      preferredServices: info.preferredServices,
      wayToWork: info.wayToWork,
      whereLeave: info.whereLeave,
      createdAt:info.createdAt,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(clientInquire: ServiceProviderInquire): PrismaServiceProviderInquire {
    return {
      id: clientInquire.id.toString(),
      ageGroup: clientInquire.ageGroup,
      city: clientInquire.city,
      emailOrNumber: clientInquire.emailOrNumber,
      preferredServices: clientInquire.preferredServices,
      wayToWork: clientInquire.wayToWork,
      whereLeave: clientInquire.whereLeave,
      createdAt: clientInquire.createdAt ? clientInquire.createdAt : new Date(),
      updatedAt: clientInquire.updatedAt ? clientInquire.updatedAt : new Date(),
    };
  }
}