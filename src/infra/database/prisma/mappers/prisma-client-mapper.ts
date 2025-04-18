import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Client } from "@/domain/users/enterprise/client";
import { UserState } from "@/domain/users/enterprise/user";
import { Client as PrismaClient } from "@prisma/client";

export type PrismaClientTypeMapper = PrismaClient & {
  user: {
    email: string;
    phoneNumber: string;
    isEmailValidated: boolean;
    isPhoneNumberValidated: boolean;
    state: UserState;
  };
};

export class PrismaClientMapper {
  static toDomain(info: PrismaClientTypeMapper): Client {
    return Client.create(
      {
        lastName: info.lastName,
        bornAt: info.bornAt,
        email: info.user.email,
        firstName: info.firstName,
        gender: info.gender,
        phoneNumber: info.user.phoneNumber,
        userId: new UniqueEntityID(info.userId),
        state: info.user.state,
        isEmailValidated: info.user.isEmailValidated,
        isPhoneNumberValidated: info.user.isPhoneNumberValidated,
      },
      new UniqueEntityID(info.id)
    );
  }

  static toPrisma(client: Client): PrismaClient {
    return {
      id: client.id.toString(),
      firstName: client.firstName,
      lastName: client.lastName,
      gender: client.gender ?? "NotTell",
      bornAt: client.bornAt,
      userId: client.userId.toString(),
      createdAt: client.createdAt ? client.createdAt : new Date(),
      updatedAt: client.updatedAt ? client.updatedAt : new Date(),
    };
  }
}
