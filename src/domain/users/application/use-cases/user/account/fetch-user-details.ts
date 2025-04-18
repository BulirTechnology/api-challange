import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository,
  AddressesRepository
} from "../../../repositories";

interface FetchUserDetailsUseCaseRequest {
  userId: string
}

type FetchUserDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: {
      id: string
      name: string
      address: string
    }
  }
>

@Injectable()
export class FetchUserDetailsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private spRepository: ServiceProvidersRepository,
    private addressRepository: AddressesRepository
  ) { }

  async execute({
    userId
  }: FetchUserDetailsUseCaseRequest): Promise<FetchUserDetailsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(""));
    }

    let name = "", addressLocation = "";
    if (user.accountType === "Client") {
      const client = await this.clientRepository.findByEmail(user.email);
      name = `${client?.firstName} ${client?.lastName}`;
    } else {
      const sp = await this.spRepository.findByEmail(user.email);
      name = `${sp?.firstName} ${sp?.lastName}`;
    }

    const addresses = await this.addressRepository.findMany({
      userId,
      page: 1,
      //isPrimary: true
    });

    if (addresses.data.length > 0) {
      addressLocation = `${addresses.data[0].name}: ${addresses.data[0].line1} ${addresses.data[0].line2}`;
    }

    return right({
      user: {
        id: user.id.toString(),
        name,
        address: addressLocation
      }
    });
  }
}
