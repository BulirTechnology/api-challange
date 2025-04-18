import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import {
  ServiceProviderInquire,
  ClientInquire
} from "../../enterprise";

import {
  ClientInquiresRepository,
  ServiceProviderInquiresRepository
} from "../repositories";

type FetchInquireUseCaseResponse = Either<
  null,
  {
    serviceProviders: ServiceProviderInquire[],
    clients: ClientInquire[]
  }
>

@Injectable()
export class FetchInquireUseCase {
  constructor(
    private clientsRepository: ClientInquiresRepository,
    private serviceProviderRepository: ServiceProviderInquiresRepository
  ) { }

  async execute(): Promise<FetchInquireUseCaseResponse> {
    const clients = await this.clientsRepository.findMany();
    const serviceProviders = await this.serviceProviderRepository.findMany();

    return right({
      clients,
      serviceProviders
    });
  }
}

