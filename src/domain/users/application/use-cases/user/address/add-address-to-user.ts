import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  AddressesRepository
} from "../../../repositories";

import { Address, LanguageSlug } from "../../../../enterprise";

interface AddAddressToUserUseCaseRequest {
  language: LanguageSlug
  userId: string
  address: {
    latitude: number
    line1: string
    line2: string
    longitude: number
    name: string
    isPrimary: boolean
  },
}

type AddAddressToUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    address: Address
  }
>

@Injectable()
export class AddAddressToUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private addressesRepository: AddressesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    address,
    userId
  }: AddAddressToUserUseCaseRequest): Promise<AddAddressToUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(
        new ResourceNotFoundError(
          this.i18n.t(
            "errors.user.not_found",
            { lang: I18nContext.current()?.lang }
          )
        )
      );
    }

    const addressToCreate = Address.create({
      isPrimary: false,
      latitude: address.latitude,
      line1: address.line1,
      line2: address.line2,
      longitude: address.longitude,
      name: address.name,
      userId: user.id,
    });

    const addressCreated = await this.addressesRepository.create(addressToCreate);
    if (address.isPrimary) {
      await this.addressesRepository.setAsPrimary(addressCreated.id.toString(), user.id.toString())
    }

    return right({
      address: addressCreated,
    });
  }
}
