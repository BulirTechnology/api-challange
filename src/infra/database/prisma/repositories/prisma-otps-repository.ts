import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { PrismaOTPMapper } from "../mappers/prisma-otp-mapper";

import { OtpRepository } from "@/domain/users/application/repositories/otp-repository";
import { Otp } from "@/domain/users/enterprise/otp";

@Injectable()
export class PrismaOTPsRepository implements OtpRepository {
  constructor(private prisma: PrismaService) { }

  async delete(data: { userId: string; }): Promise<void> {
    await this.prisma.otp.deleteMany({
      where: {
        userId: data.userId
      }
    });
  }

  async validate(id: string): Promise<void> {
    await this.prisma.otp.delete({
      where: {
        id
      },
    });
  }
  
  async findByUserIdAndCode(data: { code: string; userId: string; }): Promise<Otp | null> {
    const response = await this.prisma.otp.findFirst({
      where: {
        code: data.code,
        userId: data.userId
      }
    });

    if (!response) return null;

    return PrismaOTPMapper.toDomain({
      code: response?.code,
      createdAt: response?.createdAt,
      expiresAt: response?.expiresAt,
      id: response?.id,
      isVerified: response?.isVerified,
      userId: response?.userId,
      verificationType: response?.verificationType
    });
  }

  async create(otp: Otp): Promise<void> {
    const data = PrismaOTPMapper.toPrisma(otp);

    await this.prisma.otp.create({
      data
    });
  }
}