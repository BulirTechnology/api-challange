import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UsersRepository } from "../../repositories";
import { MailSender } from "../../mail/mail-sender";
import { DateProvider } from "../../date/date-provider";
import { EnvService } from "@/infra/environment/env.service";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import jwt from "jsonwebtoken";

interface SendRequestToRecoverBackofficePasswordUseCaseRequest {
  email: string;
  accountType: "SuperAdmin";
}
type SendRequestToRecoverBackofficePasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string;
  }
>;

@Injectable()
export class SendRequestToRecoverBackofficePasswordUseCase {
  constructor(
    private env: EnvService,
    private usersRepository: UsersRepository,
    private mailSender: MailSender,
    private dateProvider: DateProvider,
    private prisma: PrismaService
  ) {}

  async execute({
    email,
    accountType,
  }: SendRequestToRecoverBackofficePasswordUseCaseRequest): Promise<SendRequestToRecoverBackofficePasswordUseCaseResponse> {
    const user = await this.usersRepository.findByEmailAndAccountType({
      email,
      accountType,
    });

    if (!user || user.authProvider !== "email") {
      return left(new ResourceNotFoundError("User not found"));
    }

    const expiresDate = this.dateProvider.addHours(3);

    const token = jwt.sign(
      { email: user.email, exp: Math.floor(expiresDate.getTime() / 1000) },
      this.env.get("JWT_PRIVATE_KEY")
    );

    await this.prisma.user.update({
      where: {
        id: user.id.toString(),
      },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: expiresDate,
      },
    });
    const resetUrl = `${this.env.get(
      "BACKOFFICE_URL"
    )}reset-password?token=${token}`;

    await this.mailSender.send({
      to: user.email,
      body: resetUrl,
      subject: "Reset Password Link",
      templateName: "backoffice-account-recover-password-verification.hbs",
      variable: {
        username: "",
        resetUrl,
      },
    });

    return right({
      message: "Email send successfully",
    });
  }
}
