import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { NotAllowedError } from "@/core/errors";

import {
  UsersRepository,
  OtpRepository
} from "../../../repositories";

import { DateProvider } from "../../../date/date-provider";
import { InvalidOTPCodeError } from "../../errors";

interface UpdateEmailUseCaseRequest {
  language: "en" | "pt"
  userId: string
  code: string,
  email: string,
  verificationFor: "Email" | "PhoneNumber"
}

type UpdateEmailUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider
  ) { }

  async execute({
    email,
    code,
    verificationFor,
    userId
  }: UpdateEmailUseCaseRequest): Promise<UpdateEmailUseCaseResponse> {
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

    if (verificationFor === "Email" && otpCode.verificationType !== "Email") {
      return left(new NotAllowedError());
    }

    await this.usersRepository.updateEmail(userId, email);

    return right(null);
  }
}
