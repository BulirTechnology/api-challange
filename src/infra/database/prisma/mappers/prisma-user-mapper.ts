import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { User } from "@/domain/users/enterprise/user";
import { User as PrismaUser } from "@prisma/client";

export class PrismaUserMapper {
  static toDomain(info: PrismaUser): User {
    return User.create(
      {
        email: info.email,
        phoneNumber: info.phoneNumber,
        password: info.password,
        accountType: info.accountType,
        createdAt: info.createdAt,
        isEmailValidated: info.isEmailValidated,
        isPhoneNumberValidated: info.isPhoneNumberValidated,
        state: info.state,
        referralCode: info.referralCode,
        referredBy: info.referredBy,
        updatedAt: info.updatedAt,
        defaultLanguage: info.defaultLanguage,
        profileUrl: info.profileUrl,
        isAuthenticated: info.isAuthenticated,
        refreshToken: info.refreshToken,
        authProvider: info.authProvider,
        online: info.online,
        alreadyLogin: info.alreadyLogin,
        socketId: `${info.socketId}`,
        notificationToken: info.notificationToken ?? "",
        resetPasswordToken: info.resetPasswordToken ?? "",
        resetPasswordTokenExpiresAt: info.resetPasswordTokenExpiresAt ?? null,
      },
      new UniqueEntityID(info.id)
    );
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id.toString(),
      email: user.email,
      defaultLanguage: user.defaultLanguage,
      createdAt: new Date(),
      isEmailValidated: false,
      isPhoneNumberValidated: false,
      online: user.online,
      password: user.password,
      state: user.state,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      updatedAt: new Date(),
      phoneNumber: user.phoneNumber,
      accountType: user.accountType,
      profileUrl: user.profileUrl + "",
      isAuthenticated: user.isAuthenticated,
      refreshToken: user.refreshToken,
      authProvider: user.authProvider,
      alreadyLogin: user.alreadyLogin,
      notificationToken: user.notificationToken,
      socketId: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    };
  }
}
