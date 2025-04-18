import { UsersRepository } from "@/domain/users/application/repositories/user-repository";

export type usersManagementGetSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalServiceProviders: number;
  totalClients: number;
};

import {
  AccountType,
  Language,
  User,
  UserState,
} from "@/domain/users/enterprise/user";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { PrismaUserMapper } from "../mappers/prisma-user-mapper";
import { Address } from "@/domain/users/enterprise/address";
import { PrismaAddressMapper } from "../mappers/prisma-address-mapper";
import { Prisma } from "@prisma/client";

export type UserWithDetails = {
  id: string;
  email: string;
  phoneNumber: string;
  state: UserState;
  addresses: {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    name: string;
    line1: string;
    line2: string;
    latitude: Prisma.Decimal;
    longitude: Prisma.Decimal;
    isPrimary: boolean;
    isActive: boolean;
    userId: string;
  }[];
  client?: {
    firstName: string;
    lastName: string;
  };
  serviceProvider?: {
    firstName: string;
    lastName: string;
  };
};

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByResetToken(token: string): Promise<User | null> {
    const response = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!response) return null;

    return PrismaUserMapper.toDomain(response);
  }

  async findProfileBy(params: {
    parentId: string;
    accountType: AccountType;
  }): Promise<User | null> {
    const response = await this.prisma.user.findFirst({
      where: {
        serviceProvider: {
          id: params.parentId,
        },
        client: {
          id: params.parentId,
        },
      },
    });

    if (!response) return null;

    return PrismaUserMapper.toDomain(response);
  }

  async updateSocketId(userId: string, socketId: string): Promise<void> {
    await this.prisma.user.update({
      data: {
        socketId: socketId,
      },
      where: {
        id: userId,
      },
    });
  }
  async setAlreadyLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      data: {
        alreadyLogin: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async updateOnlineState(userId: string, onlineState: boolean): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        online: onlineState,
      },
    });
  }

  async updateNotificationToken(
    userId: string,
    notificationToken: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        notificationToken,
      },
    });
  }

  async findByPhoneNumberAndAccountType(data: {
    phoneNumber: string;
    accountType: "Client" | "ServiceProvider" | "SuperAdmin";
  }): Promise<User | null> {
    const response = await this.prisma.user.findFirst({
      where: {
        phoneNumber: data.phoneNumber,
        accountType: data.accountType,
      },
    });

    if (!response) return null;

    return PrismaUserMapper.toDomain(response);
  }
  async updateReferralCode(
    userId: string,
    referralCode: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        referralCode,
      },
    });
  }
  async existThisReferralCode(referralCode: string): Promise<boolean> {
    const total = await this.prisma.user.count({
      where: {
        referralCode,
      },
    });

    return total > 0;
  }
  async updateRefreshToken(params: {
    userId: string;
    refreshToken: string;
    isAuthenticated: boolean;
  }): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        refreshToken: params.refreshToken,
        isAuthenticated: params.isAuthenticated,
      },
    });
  }
  async updateState(userId: string, state: UserState): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        state,
      },
    });
  }
  async findMainAddress(userId: string): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: {
        isPrimary: true,
        userId,
      },
    });

    if (!address) {
      return PrismaAddressMapper.toDomain({
        id: "",
        createdAt: new Date(),
        isActive: false,
        isPrimary: true,
        latitude: new Prisma.Decimal(0),
        line1: "",
        line2: "",
        longitude: new Prisma.Decimal(0),
        name: "",
        updatedAt: new Date(),
        userId,
      });
    }

    return PrismaAddressMapper.toDomain(address);
  }
  async updateProfileImage(params: {
    userId: string;
    profileUrl: string;
  }): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        profileUrl: params.profileUrl,
      },
    });
  }
  async updateDefaultLanguage(
    userId: string,
    language: Language
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        defaultLanguage: language,
      },
    });
  }
  async updatePhoneNumber(userId: string, phoneNumber: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phoneNumber,
      },
    });
  }
  async updateEmail(userId: string, email: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
      },
    });
  }
  async findById(userId: string): Promise<User | null> {
    const response = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!response) return null;

    return PrismaUserMapper.toDomain(response);
  }
  async updatePassword(
    userId: string,
    newHashedPassword: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashedPassword,
      },
    });
  }

  async findByEmailAndAccountType(data: {
    email: string;
    accountType: "Client" | "ServiceProvider" | "SuperAdmin";
  }): Promise<User | null> {
    const response = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        accountType: data.accountType,
      },
    });

    if (!response) return null;

    return PrismaUserMapper.toDomain(response);
  }

  async validatedEmail(id: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isEmailValidated: true,
      },
    });
  }

  async validatePhoneNumber(id: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isPhoneNumberValidated: true,
      },
    });
  }

  async create(user: User): Promise<User> {
    const data = PrismaUserMapper.toPrisma(user);

    const userCreated = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        state: "Inactive",
        phoneNumber: data.phoneNumber,
        accountType: data.accountType,
        authProvider: data.authProvider,
        referralCode: data.referralCode,
      },
    });

    return PrismaUserMapper.toDomain(userCreated);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      referredBy: user.referredBy,
      password: user.password,
      createdAt: user.createdAt,
      isEmailValidated: false,
      isPhoneNumberValidated: false,
      state: user.state,
      defaultLanguage: user.defaultLanguage,
      updatedAt: user.updatedAt,
      accountType: user.accountType,
      profileUrl: user.profileUrl,
      isAuthenticated: false,
      refreshToken: user.refreshToken,
      authProvider: user.authProvider,
      referralCode: user.referralCode,
      alreadyLogin: user.alreadyLogin,
      online: user.online,
      notificationToken: user.notificationToken,
      socketId: user.socketId,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordTokenExpiresAt: user.resetPasswordTokenExpiresAt,
    });
  }

  async findDetailsByUserId(userId: string): Promise<any> {
    const response = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        addresses: true,
        client: {
          include: {
            booking: {
              include: {
                job: true,
              },
            },
          },
        },
        serviceProvider: {
          include: {
            bookings: {
              include: {
                job: true,
              },
            },
          },
        },
      },
    });

    if (!response) return null;

    return response;
  }

  async usersManagementGetSummaryByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalServiceProviders: number;
    totalClients: number;
  }> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalServiceProviders,
      totalClients,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          state: "Active",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          state: "Inactive",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          accountType: "ServiceProvider",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          accountType: "Client",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalServiceProviders,
      totalClients,
    };
  }

  async usersManagementFindByAccountType(
    accountType: AccountType,
    page: number = 1,
    limit: number = 10,
    filters?: {
      name?: string;
      telephone?: string;
      id?: string;
      status?: string;
    }
  ): Promise<{
    users: UserWithDetails[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      accountType,
      ...(filters?.name && {
        OR: [
          {
            client: {
              firstName: { contains: filters.name, mode: "insensitive" },
            },
          },
          {
            client: {
              lastName: { contains: filters.name, mode: "insensitive" },
            },
          },
          {
            serviceProvider: {
              firstName: { contains: filters.name, mode: "insensitive" },
            },
          },
          {
            serviceProvider: {
              lastName: { contains: filters.name, mode: "insensitive" },
            },
          },
        ],
      }),
      ...(filters?.telephone && {
        phoneNumber: { contains: filters.telephone, mode: "insensitive" },
      }),
      ...(filters?.id && { id: filters.id }),
      ...(filters?.status && { state: filters.status as UserState }),
    };

    const [users, totalUsers] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          state: true,
          addresses: {
            select: {
              id: true,
              name: true,
              line1: true,
              line2: true,
              latitude: true,
              longitude: true,
              isPrimary: true,
              isActive: true,
              userId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          client:
            accountType === "Client"
              ? {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                }
              : undefined,
          serviceProvider:
            accountType === "ServiceProvider"
              ? {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                }
              : undefined,
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    const mappedUsers: UserWithDetails[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      state: user.state,
      addresses: user.addresses,
      client: user.client
        ? {
            firstName: user.client.firstName,
            lastName: user.client.lastName,
          }
        : undefined,
      serviceProvider: user.serviceProvider
        ? {
            firstName: user.serviceProvider.firstName,
            lastName: user.serviceProvider.lastName,
          }
        : undefined,
    }));

    return {
      users: mappedUsers,
      totalUsers,
      currentPage: page,
      totalPages,
    };
  }
}
