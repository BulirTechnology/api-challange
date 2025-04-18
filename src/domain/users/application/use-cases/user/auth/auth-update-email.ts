import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { NotAllowedError } from "@/core/errors";

import {
  UsersRepository,
  OtpRepository,
  EmailPhoneUpdateRepository
} from "../../../repositories";

import { DateProvider } from "../../../date/date-provider";
import { InvalidOTPCodeError } from "../../errors/invalid-otp-code-error";

interface AuthUpdateEmailUseCaseRequest {
  language: "en" | "pt"
  userId: string
  code: string,
  verificationFor: "Email" | "PhoneNumber"
}

type AuthUpdateEmailUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class AuthUpdateEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private emailPhoneUpdateRepository: EmailPhoneUpdateRepository
  ) { }

  async execute({
    code,
    verificationFor,
    userId
  }: AuthUpdateEmailUseCaseRequest): Promise<AuthUpdateEmailUseCaseResponse> {
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
    console.log("differenc in hour: ", differentInHours);
    if (differentInHours < 0) {
      return left(new NotAllowedError());
    }

    if (verificationFor === "Email" && otpCode.verificationType !== "Email") {
      return left(new NotAllowedError());
    }

    const dataToUpdate = await this.emailPhoneUpdateRepository.findByUserId({
      userId,
      type: "Email"
    });
    console.log("valod da tatoupdate: ", dataToUpdate);
    if (!dataToUpdate) {
      return left(new InvalidOTPCodeError());
    }

    await this.usersRepository.updateEmail(userId, dataToUpdate.emailOrPhone);
    await this.emailPhoneUpdateRepository.delete(dataToUpdate.id.toString());
    return right(null);
  }
}
