import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { EmailPhoneUpdate } from "@/domain/users/enterprise/email-phone-update";
import { EmailPhoneUpdate as PrismaEmailPhoneUpdate } from "@prisma/client";

export class PrismaEmailPhoneUpdateMapper {
  static toDomain(info: PrismaEmailPhoneUpdate): EmailPhoneUpdate {
    return EmailPhoneUpdate.create({
      emailOrPhone: info.emailOrPhone,
      type: info.type,
      userId: new UniqueEntityID(info.userId),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(emailPhoneUpdate: EmailPhoneUpdate): PrismaEmailPhoneUpdate {
    return {
      id: emailPhoneUpdate.id.toString(),
      createdAt: emailPhoneUpdate.createdAt ? emailPhoneUpdate.createdAt : new Date(),
      emailOrPhone: emailPhoneUpdate.emailOrPhone,
      type: emailPhoneUpdate.type,
      updatedAt: emailPhoneUpdate.updatedAt ? emailPhoneUpdate.updatedAt : new Date(),
      userId: emailPhoneUpdate.userId.toString()
    };
  }
}

