import {
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Body
} from "@nestjs/common";
import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { WithdrawMoneyOnWalletUseCase } from "@/domain/payment/application/use-case/withdraw-money-on-wallet";
import { ValidationService } from "../../../pipes/validation.service";

const withdrawMoneyOnWalletBodySchema = z.object({
  amount: z.number(),
});

type WithdrawMoneyOnWalletBodySchema = z.infer<typeof withdrawMoneyOnWalletBodySchema>

@ApiTags("Wallet")
@Controller("/wallet")
@UseGuards(JwtAuthGuard)
export class WithdrawMoneyOnWalletController {
  constructor(
    private withdrawMoneyOnWallet: WithdrawMoneyOnWalletUseCase,
    private validation: ValidationService
  ) { }

  @Post("withdraw")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: WithdrawMoneyOnWalletBodySchema
  ) {
    try {
      await this.validation.validateData(withdrawMoneyOnWalletBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.withdrawMoneyOnWallet.execute({
      userId: user.sub,
      amount: data.amount
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException("");
    }
  }
}