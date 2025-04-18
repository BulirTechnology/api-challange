import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { NotAllowedError } from "@/core/errors";

import { UsersRepository, OtpRepository } from "../../repositories";

import { DateProvider } from "../../date/date-provider";
import { HashGenerator } from "../../cryptography";
import { InvalidOTPCodeError } from "../errors";

interface SendForgotPasswordMailUseCaseRequest {
  language: "en" | "pt";
  email?: string | null;
  resetToken: string;
  newPassword: string;
}

type SendForgotPasswordMailUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string;
  }
>;

@Injectable()
export class SendForgotPasswordMailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
    private dateProvider: DateProvider,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    email,
    newPassword,
    resetToken,
  }: SendForgotPasswordMailUseCaseRequest): Promise<SendForgotPasswordMailUseCaseResponse> {
    let user;
    if (email) {
      user = await this.usersRepository.findByEmail(email);
    } else {
      user = await this.usersRepository.findUserByResetToken(resetToken);
    }

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    if (resetToken.length <= 4) {
      const otpCode = await this.otpRepository.findByUserIdAndCode({
        userId: user.id.toString(),
        code: resetToken,
      });

      if (!otpCode) {
        return left(new InvalidOTPCodeError());
      }
      const differentInHours = this.dateProvider.compareInHours(
        new Date(),
        otpCode.expiresAt
      );
      if (differentInHours < 0) {
        return left(new NotAllowedError());
      }

      if (otpCode.verificationType !== "Email") {
        return left(new NotAllowedError());
      }
    } else {
      if (user.resetPasswordToken !== resetToken) {
        return left(new NotAllowedError());
      }

      const differentInHours = this.dateProvider.compareInHours(
        new Date(),
        user.resetPasswordTokenExpiresAt
      );
      if (differentInHours < 0) {
        return left(new NotAllowedError());
      }
    }

    const hashedPassword = await this.hashGenerator.hash(newPassword);
    await this.usersRepository.updatePassword(
      user.id.toString(),
      hashedPassword
    );

    return right({
      message: "Password updated",
    });
  }
}
