import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { TransactionPresenter } from "@/infra/http/presenters/transaction-presenter";
import { FetchUserTransactionDetailsUseCase } from "@/domain/payment/application/use-case/fetch-user-transaction-details";

@ApiTags("Wallet")
@Controller("/wallet")
export class FetchUserTransactionDetailsController {
  constructor(
    private fetchUserTransactionDetailsUseCase: FetchUserTransactionDetailsUseCase
  ) { }

  @Get("transactions/:transactionId")
  @UseGuards(JwtAuthGuard)
  async handle(
    @Param("transactionId") transactionId: string,
    @Headers() headers: Record<string, string>
  ) {
    const result = await this.fetchUserTransactionDetailsUseCase.execute({
      transactionId,
      language: headers["accept-language"] == "en" ? "en" : "pt",
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      transaction: TransactionPresenter.toHTTP(result.value.transaction)
    };
  }

}