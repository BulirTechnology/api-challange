import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Otp } from "@/domain/users/enterprise/otp";
import { Otp as PrismaOTP } from "@prisma/client";

export class PrismaOTPMapper {
  static toDomain(info: PrismaOTP): Otp {
    return Otp.create({
      code: info.code,
      expiresAt: info.expiresAt,
      isVerified: info.isVerified,
      userId: new UniqueEntityID(info.userId),
      verificationType: info.verificationType,
      createdAt: info.createdAt,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(otp: Otp): PrismaOTP {
    return {
      code: otp.code,
      createdAt: otp.createdAt,
      expiresAt: otp.expiresAt,
      id: otp.id.toString(),
      isVerified: otp.isVerified,
      userId: otp.userId.toString(),
      verificationType: otp.verificationType
    };
  }
}