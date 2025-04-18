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
import { WalletPresenter } from "@/infra/http/presenters/wallet-presenter";
import { FetchUserWalletBalanceUseCase } from "@/domain/payment/application/use-case/fetch-user-wallet-balance";

@ApiTags("Wallet")
@Controller("/wallet")
export class FetchUserWalletBalanceController {
  constructor(
    private fetchUserWalletBalanceUseCase: FetchUserWalletBalanceUseCase
  ) { }

  @Get("balance")
  @UseGuards(JwtAuthGuard)
  async handle(
    @AuthenticatedUser() user: AuthPayload
  ) {
    const result = await this.fetchUserWalletBalanceUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      wallet: WalletPresenter.toHTTP(result.value.wallet)
    };
  }

}