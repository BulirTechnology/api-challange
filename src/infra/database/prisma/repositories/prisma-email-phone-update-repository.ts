import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { EmailPhoneUpdateRepository } from "@/domain/users/application/repositories/email-phone-update-repository";
import { EmailPhoneUpdate } from "@/domain/users/enterprise/email-phone-update";
import { PrismaEmailPhoneUpdateMapper } from "../mappers/prisma-email-phone-update-mapper";

@Injectable()
export class PrismaEmailPhoneUpdateRepository implements EmailPhoneUpdateRepository {
  constructor(private prisma: PrismaService) { }
  
  async findByUserId(data: { type: "Email" | "Phone"; userId: string; }): Promise<EmailPhoneUpdate | null> {
    const info = await this.prisma.emailPhoneUpdate.findFirst({
      where: {
        type: data.type,
        userId: data.userId
      }
    });

    if (!info) return null;

    return PrismaEmailPhoneUpdateMapper.toDomain(info);
  }
  async create(data: EmailPhoneUpdate): Promise<void> {
    const info = PrismaEmailPhoneUpdateMapper.toPrisma(data);

    await this.prisma.emailPhoneUpdate.create({
      data: {
        emailOrPhone: info.emailOrPhone,
        type: info.type,
        userId: info.userId
      }
    });
  }
  async delete(id: string): Promise<void> {
    await this.prisma.emailPhoneUpdate.delete({
      where: {
        id
      }
    });
  }
  
}