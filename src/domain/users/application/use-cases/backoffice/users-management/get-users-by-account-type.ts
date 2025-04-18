import { Address, AddressProps } from "@/domain/users/enterprise";
import { AddressesRepository, UsersRepository } from "../../../repositories";
import { Injectable } from "@nestjs/common";
import { UserWithDetails } from "@/infra/database/prisma/repositories/prisma-users-repository";
import { PrismaAddressMapper } from "@/infra/database/prisma/mappers/prisma-address-mapper";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PrismaHelpersRatingAndFavoriteRepository } from "@/infra/database/prisma/prisma-common-helpers.service";
import { UserDTO } from "./dtos/users-management.dto";

@Injectable()
export class GetUsersByAccountTypeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private helpers: PrismaHelpersRatingAndFavoriteRepository
  ) {}

  private formatAddress(address: any): AddressProps {
    return {
      latitude: address.latitude.toNumber(),
      longitude: address.longitude.toNumber(),
      line1: address.line1,
      line2: address.line2,
      name: address.name,
      isPrimary: address.isPrimary,
      createdAt: address.createdAt,
      userId: new UniqueEntityID(address.userId),
    };
  }

  async execute(
    accountType: "Client" | "ServiceProvider" | "SuperAdmin",
    page: number,
    limit: number,
    filters?: {
      name?: string;
      telephone?: string;
      id?: string;
      status?: string;
    }
  ): Promise<{
    data: UserDTO[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
  }> {
    const data = await this.usersRepository.usersManagementFindByAccountType(
      accountType,
      page,
      limit,
      filters
    );

    const userDTOs: UserDTO[] = await Promise.all(
      data.users.map(async (user: UserWithDetails) => {
        let fullName: string | undefined;
        let telephone: string | undefined;
        let address: AddressProps | undefined;
        let rating: number | undefined;

        if (accountType === "Client") {
          fullName = `${user.client?.firstName} ${user.client?.lastName}`;
          telephone = user.phoneNumber;
          address =
            user.addresses.length > 0
              ? this.formatAddress(user.addresses[0])
              : undefined;
          rating = await this.helpers.getUserRating(user.id);
        } else if (accountType === "ServiceProvider") {
          fullName = `${user.serviceProvider?.firstName} ${user.serviceProvider?.lastName}`;
          telephone = user.phoneNumber;
          address =
            user.addresses.length > 0
              ? this.formatAddress(user.addresses[0])
              : undefined;
          rating = await this.helpers.getUserRating(user.id);
        }

        return {
          id: user.id,
          fullName,
          email: user.email,
          telephone,
          status: user.state,
          address,
          rating,
        };
      })
    );

    return {
      data: userDTOs,
      totalUsers: data.totalUsers,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
    };
  }
}
