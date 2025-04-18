import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ClientWalletPresenter } from "@/infra/http/presenters/wallet-presenter";
import { FetchClientWalletBalanceUseCase } from "@/domain/payment/application/use-case/fetch-client-wallet-balance";

@ApiTags("Wallet")
@Controller("/clients")
export class FetchClientWalletBalanceController {
  constructor(
    private fetchClientWalletBalanceUseCase: FetchClientWalletBalanceUseCase
  ) { }
 
  @Get("wallet/balance")
  @UseGuards(JwtAuthGuard)
  async handle(
    @AuthenticatedUser() user: AuthPayload
  ) {
    const result = await this.fetchClientWalletBalanceUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      wallet: ClientWalletPresenter.toHTTP(result.value.wallet)
    };
  }

}