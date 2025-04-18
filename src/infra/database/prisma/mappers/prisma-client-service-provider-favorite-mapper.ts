import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ClientServiceProviderFavorite } from "@/domain/users/enterprise/client-service-provider-favorite";
import { ClientServiceProviderFavorite as PrismaClientServiceProviderFavorite } from "@prisma/client";

export class PrismaClientServiceProviderFavoriteMapper {
  static toDomain(info: PrismaClientServiceProviderFavorite): ClientServiceProviderFavorite {
    return ClientServiceProviderFavorite.create({
      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
      clientId: new UniqueEntityID(info.clientId),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(favorite: ClientServiceProviderFavorite): PrismaClientServiceProviderFavorite {
    return {
      createdAt: new Date(),
      id: favorite.id.toString(),
      serviceProviderId: favorite.serviceProviderId.toString(),
      clientId: favorite.clientId.toString(),
      updatedAt: favorite.updatedAt ? favorite.updatedAt : null,
    };
  }
}