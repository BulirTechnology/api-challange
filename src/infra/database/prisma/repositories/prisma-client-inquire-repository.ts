import { ClientInquiresRepository } from "@/domain/inquire/application/repositories/client-inquire-repository";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { ClientInquire } from "@/domain/inquire/enterprise/client-inquire";
import { PrismaClientInquireMapper } from "../mappers/prisma-client-inquire-mapper";

@Injectable()
export class PrismaClientInquiresRepository implements ClientInquiresRepository {
  constructor(private prisma: PrismaService) { }
  
  async findMany(): Promise<ClientInquire[]> {
    const data = await this.prisma.clientInquire.findMany();

    return data.map(PrismaClientInquireMapper.toDomain);
  }

  async create(clientInquire: ClientInquire): Promise<void> {
    const data = PrismaClientInquireMapper.toPrisma(clientInquire);

    await this.prisma.clientInquire.create({
      data: {
        ageGroup: data.ageGroup,
        city: data.city,
        emailOrNumber: data.emailOrNumber,
        spendOnServices: data.spendOnServices,
        wayFindServiceProvider: data.wayFindServiceProvider,
        whereLeave: data.whereLeave,
        preferredServices: data.preferredServices,
      }
    });
  }

}