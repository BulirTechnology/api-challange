import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ClientInquire } from "@/domain/inquire/enterprise/client-inquire";

import { ClientInquire as PrismaClientInquire } from "@prisma/client";
 
export class PrismaClientInquireMapper {
  static toDomain(info: PrismaClientInquire): ClientInquire {
    return ClientInquire.create({
      ageGroup: info.ageGroup,
      city: info.city,
      emailOrNumber: info.emailOrNumber,
      preferredServices: info.preferredServices,
      spendOnServices: info.spendOnServices,
      wayFindServiceProvider: info.wayFindServiceProvider,
      whereLeave: info.whereLeave,
      createdAt: info.createdAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(clientInquire: ClientInquire): PrismaClientInquire {
    return {
      id: clientInquire.id.toString(),
      ageGroup: clientInquire.ageGroup,
      city: clientInquire.city,
      emailOrNumber: clientInquire.emailOrNumber,
      preferredServices: clientInquire.preferredServices,
      spendOnServices: clientInquire.spendOnServices,
      wayFindServiceProvider: clientInquire.wayFindServiceProvider,
      whereLeave: clientInquire.whereLeave,
      createdAt: clientInquire.createdAt ? clientInquire.createdAt : new Date(),
      updatedAt: clientInquire.updatedAt ? clientInquire.updatedAt : new Date(),
    };
  }
}