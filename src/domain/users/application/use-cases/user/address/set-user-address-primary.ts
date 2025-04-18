import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  AddressesRepository
} from "../../../repositories";

import { InvalidAddressError } from "../../errors";
import { LanguageSlug } from "@/domain/users/enterprise";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface SetUserAddressPrimaryUseCaseRequest {
  language: LanguageSlug
  userId: string
  addressId: string
}

type SetUserAddressPrimaryUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class SetUserAddressPrimaryUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private addressesRepository: AddressesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    addressId
  }: SetUserAddressPrimaryUseCaseRequest): Promise<SetUserAddressPrimaryUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(
        new ResourceNotFoundError(
          processI18nMessage(this.i18n, "errors.user.not_found")
        )
      );
    }

    const addressItem = await this.addressesRepository.findById(addressId);
    if (addressItem?.userId.toString() !== userId) {
      return left(new InvalidAddressError());
    }

    await this.addressesRepository.setAsPrimary(addressId, userId);

    return right(null);
  }
}
