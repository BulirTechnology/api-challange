import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Address, LanguageSlug } from "../../../../enterprise";
import { AddressesRepository } from "../../../repositories";

interface FetchUserAddressesUseCaseRequest {
  language: LanguageSlug
  page: number
  perPage?: number
  userId: string
}

type FetchUserAddressesUseCaseResponse = Either<
  null,
  {
    addresses: Address[],
    meta: MetaPagination
  }
>

@Injectable()
export class FetchUserAddressesUseCase {
  constructor(private userAddressesRepository: AddressesRepository) { }

  async execute({
    page,
    userId,
    perPage
  }: FetchUserAddressesUseCaseRequest): Promise<FetchUserAddressesUseCaseResponse> {
    const userAddresses = await this.userAddressesRepository.findMany({
      perPage,
      page,
      userId
    });

    return right({
      addresses: userAddresses.data,
      meta: userAddresses.meta
    });
  }
}
