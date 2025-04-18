import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { AddressesRepository } from "../../../repositories";
import { InvalidAddressError } from "../../errors";

import { Address, LanguageSlug } from "@/domain/users/enterprise";

interface UpdateUserAddressUseCaseRequest {
  language: LanguageSlug
  userId: string
  addressId: string
  address: {
    latitude: number
    line1: string
    line2: string
    longitude: number
    name: string
  },
}

type UpdateUserAddressUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateUserAddressUseCase {
  constructor(
    private addressesRepository: AddressesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    address,
    addressId
  }: UpdateUserAddressUseCaseRequest): Promise<UpdateUserAddressUseCaseResponse> {
    const addressItem = await this.addressesRepository.findById(addressId);

    if (!addressItem) {
      return left(
        new ResourceNotFoundError(
          this.i18n.t(
            "errors.address.not_found",
            { lang: I18nContext.current()?.lang }
          )
        )
      );
    }

    if (addressItem?.userId.toString() !== userId) {
      return left(new InvalidAddressError());
    }

    const addressToUpdate = Address.create({
      isPrimary: addressItem.isPrimary,
      latitude: address.latitude,
      line1: address.line1,
      line2: address.line2,
      longitude: address.longitude,
      name: address.name,
      userId: addressItem.userId,
      createdAt: addressItem.createdAt,
      updatedAt: addressItem.updatedAt
    }, addressItem.id);

    await this.addressesRepository.update(addressId, addressToUpdate);

    return right(null);
  }
}
