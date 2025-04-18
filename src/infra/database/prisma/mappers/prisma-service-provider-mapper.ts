import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ServiceProvider } from "@/domain/users/enterprise/service-provider";
import { UserState } from "@/domain/users/enterprise/user";
import { ServiceProvider as PrismaServiceProvider, Specialization } from "@prisma/client";

export type PrismaServiceProviderMapperType = PrismaServiceProvider & {
  isFavorite: boolean
  user: {
    email: string,
    phoneNumber: string,
    isEmailValidated: boolean,
    isPhoneNumberValidated: boolean,
    state: UserState
    rating: number
    profileUrl: string
  }
  specializations: Specialization[]
}

export class PrismaServiceProviderMapper {
  static toDomain(info: PrismaServiceProviderMapperType): ServiceProvider {
    return ServiceProvider.create({
      lastName: info.lastName,
      bornAt: info.bornAt,
      email: info.user.email,
      firstName: info.firstName,
      gender: info.gender,
      phoneNumber: info.user.phoneNumber,
      userId: new UniqueEntityID(info.userId),
      state: info.user.state,
      isFavorite: info.isFavorite,
      description: info.description,
      education: info.education,
      isEmailValidated: info.user.isEmailValidated,
      isPhoneNumberValidated: info.user.isPhoneNumberValidated,
      profileUrl: info.user.profileUrl,
      hasBudget: info.hasBudget,
      hasCertificateByBulir: info.hasCertificateByBulir,
      rating: info.user.rating
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(serviceProvider: ServiceProvider): PrismaServiceProvider {
    return {
      id: serviceProvider.id.toString(),
      firstName: serviceProvider.firstName,
      lastName: serviceProvider.lastName,
      gender: serviceProvider.gender,
      bornAt: serviceProvider.bornAt,
      isApproved: !!serviceProvider.isApproved,
      description: serviceProvider.description,
      education: serviceProvider.education,
      userId: serviceProvider.userId.toString(),
      hasBudget: serviceProvider.hasBudget,
      hasCertificateByBulir: serviceProvider.hasCertificateByBulir,
      createdAt: serviceProvider.createdAt ? serviceProvider.createdAt : new Date(),
      updatedAt: serviceProvider.updatedAt ? serviceProvider.updatedAt : new Date(),
      subscriptionId: ""
    };
  }
}