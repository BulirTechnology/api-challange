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
import { AddMoneyOnWalletUseCase } from "@/domain/payment/application/use-case/add-money-on-wallet";
import { ValidationService } from "../../../pipes/validation.service";

const addMoneyOnWalletBodySchema = z.object({
  amount: z.number(),
});

type AddMoneyOnWalletBodySchema = z.infer<typeof addMoneyOnWalletBodySchema>

@ApiTags("Wallet")
@Controller("/wallet")
@UseGuards(JwtAuthGuard)
export class AddMoneyOnWalletController {
  constructor(
    private addMoneyOnWallet: AddMoneyOnWalletUseCase,
    private validation: ValidationService
  ) { }

  @Post("balance")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AddMoneyOnWalletBodySchema
  ) {
    try {
      await this.validation.validateData(addMoneyOnWalletBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addMoneyOnWallet.execute({
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