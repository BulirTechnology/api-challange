import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  ServiceProvidersRepository
} from "../../../repositories";

import { WalletRepository } from "@/domain/payment/application/repositories";

import { Wallet } from "@/domain/payment/enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateServiceProviderStateUseCaseRequest {
  language: LanguageSlug
  serviceProviderId: string
  state: "Inactive" | "SetupAccount" | "UnderReview"
}

type UpdateServiceProviderStateUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateServiceProviderStateUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private walletRepository: WalletRepository
  ) { }

  async execute({
    serviceProviderId,
    state
  }: UpdateServiceProviderStateUseCaseRequest): Promise<UpdateServiceProviderStateUseCaseResponse> {
    const serviceProvider = await this.serviceProviderRepository.findById(serviceProviderId);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider register not found"));
    }

    const user = await this.userRepository.findByEmail(serviceProvider.email);

    if (!user) {
      return left(new ResourceNotFoundError("User register not found"));
    }

    await this.userRepository.updateState(user?.id.toString(), state);

    if (state === "SetupAccount") {
      const wallet = await this.walletRepository.findByUserId(user.id.toString());

      if (!wallet) {
        const createdWallet = Wallet.create({
          balance: 0,
          creditBalance: 0,
          userId: user.id,
        });

        await this.walletRepository.create(createdWallet);
      }
    }

    return right(null);
  }
}
