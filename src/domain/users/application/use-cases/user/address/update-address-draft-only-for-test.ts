import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Address, LanguageSlug } from "@/domain/users/enterprise";

import {
  AddressesRepository,
  UsersRepository
} from "../../../repositories";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";

interface UpdateAddressUseCaseRequest {
  language: LanguageSlug
  userId: string
  addressId: string
  address: {
    name: string
    line1: string
    line2: string
    latitude: number
    longitude: number
  }
}

type UpdateAddressUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateAddressUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private addressesRepository: AddressesRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    userId,
    address,
    addressId
  }: UpdateAddressUseCaseRequest): Promise<UpdateAddressUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(
        new ResourceNotFoundError(
          processI18nMessage(this.i18n, "errors.user.not_found")
        )
      );
    }

    const addressUpdated = Address.create({
      latitude: address.latitude,
      line1: address.line1,
      line2: address.line2,
      longitude: address.longitude,
      name: address.name,
      userId: new UniqueEntityID(userId),
      isPrimary: false
    });

    await this.addressesRepository.update(addressId, addressUpdated);

    return right(null);
  }
}
