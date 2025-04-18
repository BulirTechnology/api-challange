import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { AddressesRepository } from "../../../repositories";

import { InvalidAddressError } from "../../errors/invalid-address-error";
import { LanguageSlug } from "@/domain/users/enterprise";

interface DeleteUserAddressUseCaseRequest {
  language: LanguageSlug
  userId: string
  addressId: string
}

type DeleteUserAddressUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class DeleteUserAddressUseCase {
  constructor(
    private addressesRepository: AddressesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    addressId
  }: DeleteUserAddressUseCaseRequest): Promise<DeleteUserAddressUseCaseResponse> {
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

    await this.addressesRepository.delete(addressItem.id.toString());

    return right(null);
  }
}
