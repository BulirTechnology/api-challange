import { Injectable } from "@nestjs/common";

import { ServiceProviderInquiresRepository } from "@/domain/inquire/application/repositories/service-provider-inquire-repository";
import { ServiceProviderInquire } from "@/domain/inquire/enterprise/service-provider-inquire";

import { PrismaService } from "../prisma.service";
import { PrismaServiceProviderInquireMapper } from "../mappers/prisma-service-provider-inquire-mapper";

@Injectable()
export class PrismaServiceProviderInquiresRepository implements ServiceProviderInquiresRepository {
  constructor(private prisma: PrismaService) { }

  async findMany(): Promise<ServiceProviderInquire[]> {
    const data = await this.prisma.serviceProviderInquire.findMany();

    return data.map(PrismaServiceProviderInquireMapper.toDomain);
  }

  async create(serviceProviderInquire: ServiceProviderInquire): Promise<void> {
    const data = PrismaServiceProviderInquireMapper.toPrisma(serviceProviderInquire);

    await this.prisma.serviceProviderInquire.create({
      data: {
        ageGroup: data.ageGroup,
        city: data.city,
        emailOrNumber: data.emailOrNumber,
        whereLeave: data.whereLeave,
        preferredServices: data.preferredServices,
        wayToWork: data.wayToWork
      }
    });
  }

}