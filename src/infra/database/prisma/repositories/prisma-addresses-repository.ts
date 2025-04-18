import { Injectable } from "@nestjs/common";
import {
  paginator,
  PaginatorTypes
} from "@nodeteam/nestjs-prisma-pagination";
import {
  Prisma,
  Address as PrismaAddress
} from "@prisma/client";

import { AddressesRepository } from "@/domain/users/application/repositories/address-repository";
import { Address } from "@/domain/users/enterprise/address";

import { PrismaAddressMapper } from "../mappers/prisma-address-mapper";
import { PrismaService } from "../prisma.service";

import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaAddressesRepository implements AddressesRepository {
  constructor(private prisma: PrismaService) { }

  async delete(id: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { id },
      data: { isActive: false }
    });
  }

  async setAsPrimary(addressId: string, userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isPrimary: false }
    });

    await this.prisma.address.update({
      where: { id: addressId },
      data: { isPrimary: true }
    });
  }
  async findMany(params: PaginationParams & { userId: string; }): Promise<Pagination<Address>> {
    const page = params.page;

    const addresses = await this.paginate({
      where: {
        userId: params.userId,
        isActive: true
      },
      orderBy: { createdAt: "desc", },
      page,
      perPage: params.perPage
    });

    return {
      data: addresses.data.map(PrismaAddressMapper.toDomain),
      meta: addresses.meta
    };
  }
  async update(id: string, address: Address): Promise<void> {
    const data = PrismaAddressMapper.toPrisma(address);

    await this.prisma.address.update({
      where: {
        id: address.id.toString(),
        userId: data.userId
      },
      data
    });
  }

  async findById(id: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where: { id }
    });

    return address ? PrismaAddressMapper.toDomain(address) : null;
  }

  async create(address: Address): Promise<Address> {
    const data = PrismaAddressMapper.toPrisma(address);

    const addressCreated = await this.prisma.address.create({ data });

    return PrismaAddressMapper.toDomain(addressCreated);
  }
  
  async paginate({ where, orderBy, page, perPage }: {
    where?: Prisma.AddressWhereInput,
    orderBy?: Prisma.AddressOrderByWithRelationInput
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaAddress>> {
    return paginate(
      this.prisma.address,
      {
        where,
        orderBy,
      },
      {
        page,
        perPage,
      },
    );
  }

}