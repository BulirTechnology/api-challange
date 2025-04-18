import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { OtpRepository, UsersRepository } from "../../repositories";
import { AccountType } from "../../../enterprise";

import { DateProvider } from "../../date/date-provider";
import { HashGenerator } from "../../cryptography";

import { InvalidOTPCodeError } from "../errors";

interface RecoverPasswordUpdateUseCaseRequest {
  language: "en" | "pt";
  accountType: AccountType;
  otp?: string;
  resetPasswordtoken?: string;
  email: string;
  password: string;
}

type RecoverPasswordUpdateUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class RecoverPasswordUpdateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    accountType,
    email,
    otp,
    resetPasswordtoken,
    password,
  }: RecoverPasswordUpdateUseCaseRequest): Promise<RecoverPasswordUpdateUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({
      accountType,
      email,
    });

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    if (user.accountType === "SuperAdmin") {
      if (!resetPasswordtoken) {
        return left(new ResourceNotFoundError("Token not found"));
      }

      if (!user.resetPasswordTokenExpiresAt) {
        return left(new ResourceNotFoundError("Token expires not found"));
      }

      const differentInHours = this.dateProvider.compareInHours(
        new Date(),
        user.resetPasswordTokenExpiresAt
      );

      if (differentInHours < 0) {
        return left(new InvalidOTPCodeError());
      }

      if (user.resetPasswordToken !== resetPasswordtoken) {
        return left(new ResourceNotFoundError("Token not found"));
      }
    } else {
      if (!otp) {
        return left(new InvalidOTPCodeError());
      }

      const otpCode = await this.otpRepository.findByUserIdAndCode({
        userId: user.id.toString(),
        code: otp,
      });

      if (!otpCode) {
        return left(new ResourceNotFoundError("OTP code not found"));
      }

      const differentInHours = this.dateProvider.compareInHours(
        new Date(),
        otpCode.expiresAt
      );

      if (differentInHours < 0) {
        return left(new InvalidOTPCodeError());
      }

      if (otpCode.verificationType !== "Password") {
        return left(new InvalidOTPCodeError());
      }
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    await this.usersRepository.updatePassword(
      user.id.toString(),
      hashedPassword
    );

    return right(null);
  }
}
