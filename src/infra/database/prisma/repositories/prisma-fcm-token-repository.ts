import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { FcmToken } from "@/domain/users/enterprise/fcm-token";
import { FcmTokenRepository } from "@/domain/users/application/repositories/fcm-token-repository";
import { PrismaFcmTokenMapper } from "../mappers/prisma-fcm-token-mapper";

@Injectable()
export class PrismaFcmTokenRepository implements FcmTokenRepository {
  constructor(private prisma: PrismaService) { }
  
  async findToken(userId: string): Promise<FcmToken | null> {
    const fcmToken = await this.prisma.notificationToken.findFirst({
      where: {
        userId
      }
    });

    if (!fcmToken) return null;

    return PrismaFcmTokenMapper.toDomain(fcmToken);
  }
  async deleteOfUser(userId: string): Promise<void> {
    await this.prisma.notificationToken.deleteMany({
      where: {
        userId
      }
    });
  }
  async createOrUpdate(fcmToken: FcmToken): Promise<void> {
    const userFcmToken = await this.prisma.notificationToken.findFirst({
      where: {
        userId: fcmToken.userId.toString()
      }
    });

    if (!userFcmToken) {
      await this.prisma.notificationToken.create({
        data: {
          deviceType: fcmToken.deviceType,
          notificationToken: fcmToken.notificationToken,
          status: fcmToken.status,
          userId:fcmToken.userId
        }
      });
    } else {
      await this.prisma.notificationToken.update({
        where: {
          id: userFcmToken.id
        },
        data: {
          notificationToken: fcmToken.notificationToken,
          status: "ACTIVE"
        }
      });
    }
  }
  

}