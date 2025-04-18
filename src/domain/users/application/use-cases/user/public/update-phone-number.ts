import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { NotAllowedError } from "@/core/errors";

import {
  OtpRepository,
  UsersRepository
} from "../../../repositories";

import { DateProvider } from "../../../date/date-provider";
import { InvalidOTPCodeError } from "../../errors";

interface UpdatePhoneNumberUseCaseRequest {
  language: "en" | "pt"
  userId: string
  code: string,
  phoneNumber: string,
}

type UpdatePhoneNumberUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdatePhoneNumberUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider
  ) { }

  async execute({
    phoneNumber,
    code,
    userId
  }: UpdatePhoneNumberUseCaseRequest): Promise<UpdatePhoneNumberUseCaseResponse> {
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

    await this.usersRepository.updatePhoneNumber(userId, phoneNumber);

    return right(null);
  }
}
