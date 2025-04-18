import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Address } from "@/domain/users/enterprise/address";
import { Prisma, Address as PrismaAddress } from "@prisma/client";

export class PrismaAddressMapper {
  static toDomain(info: PrismaAddress): Address {
    return Address.create({
      latitude: info.latitude.toNumber(),
      line1: info.line1,
      line2: info.line2,
      longitude: info.longitude.toNumber(),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      name: info.name,
      userId: new UniqueEntityID(info.userId),
      isPrimary: info.isPrimary
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(address: Address): PrismaAddress {
    return {
      id: address.id.toString(),
      isPrimary: address.isPrimary,
      latitude: new Prisma.Decimal(address.latitude),
      line1: address.line1,
      line2: address.line2,
      longitude: new Prisma.Decimal(address.longitude),
      name: address.name,
      userId: address.userId.toString(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}