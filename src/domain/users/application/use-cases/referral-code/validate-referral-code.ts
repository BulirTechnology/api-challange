import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";

import { UsersRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface ValidateReferralCodeUseCaseRequest {
  language: LanguageSlug
  referralCode: string
}

type ValidateReferralCodeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    exist: boolean
  }
>

@Injectable()
export class ValidateReferralCodeUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) { }

  async execute({
    referralCode
  }: ValidateReferralCodeUseCaseRequest): Promise<ValidateReferralCodeUseCaseResponse> {
    const exist = await this.usersRepository.existThisReferralCode(referralCode);

    return right({
      exist
    });
  }
}
