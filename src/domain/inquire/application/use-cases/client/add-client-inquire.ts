import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import {
  AgeGroup,
  ClientInquire,
  LuandaCity,
  SpendOnServices,
  WayFindServiceProvider
} from "@/domain/inquire/enterprise/client-inquire";

import { ClientInquiresRepository } from "../../repositories";

interface AddClientInquireUseCaseRequest {
  client: {
    emailOrNumber: string
    city: LuandaCity
    whereLeave: string
    ageGroup: AgeGroup
    preferredServices: string[]
    spendOnServices: SpendOnServices
    wayFindServiceProvider: WayFindServiceProvider,
    createdAt: Date
  },
}

type AddClientInquireUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AddClientInquireUseCase {
  constructor(
    private clientInquireRepository: ClientInquiresRepository,
  ) { }

  async execute({
    client
  }: AddClientInquireUseCaseRequest): Promise<AddClientInquireUseCaseResponse> {

    const inquire = ClientInquire.create({
      ageGroup: client.ageGroup,
      city: client.city,
      emailOrNumber: client.emailOrNumber,
      preferredServices: client.preferredServices,
      spendOnServices: client.spendOnServices,
      wayFindServiceProvider: client.wayFindServiceProvider,
      whereLeave: client.whereLeave,
      createdAt: client.createdAt
    });

    await this.clientInquireRepository.create(inquire);

    return right({
      message: "Operação terminada com sucesso!",
    });
  }
}
