import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  NotAllowedError
} from "@/core/errors";
import { } from "@/core/errors";

import {
  OtpRepository,
  UsersRepository,
  EmailPhoneUpdateRepository
} from "../../../repositories";

import { DateProvider } from "../../../date/date-provider";
import { InvalidOTPCodeError } from "../../errors";

interface AuthUpdatePhoneNumberUseCaseRequest {
  language: "en" | "pt"
  userId: string
  code: string,
}

type AuthUpdatePhoneNumberUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class AuthUpdatePhoneNumberUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private emailPhoneUpdateRepository: EmailPhoneUpdateRepository
  ) { }

  async execute({
    code,
    userId
  }: AuthUpdatePhoneNumberUseCaseRequest): Promise<AuthUpdatePhoneNumberUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const otpCode = await this.otpRepository.findByUserIdAndCode({
      userId: user.id.toString(),
      code
    });

    if (!otpCode) {
      return left(new InvalidOTPCodeError());
    }

    const differentInHours = this.dateProvider.compareInHours(new Date(), otpCode.expiresAt);

    if (differentInHours < 0) {
      return left(new NotAllowedError());
    }

    const dataToUpdate = await this.emailPhoneUpdateRepository.findByUserId({
      userId,
      type: "Phone"
    });

    if (!dataToUpdate) {
      return left(new InvalidOTPCodeError());
    }

    await this.usersRepository.updatePhoneNumber(userId, dataToUpdate.emailOrPhone);
    await this.emailPhoneUpdateRepository.delete(dataToUpdate.id.toString());

    return right(null);
  }
}
