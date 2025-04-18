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
import { FetchAccountOverviewUseCase } from "@/domain/users/application/use-cases/service-provider/wallet/fetch-account-overview";

@ApiTags("Wallet")
@Controller("/wallet")
export class FetchAccountOverviewController {
  constructor(
    private fetchAccountOverviewUseCase: FetchAccountOverviewUseCase
  ) { }
 
  @Get("overview")
  @UseGuards(JwtAuthGuard)
  async handle(
    @AuthenticatedUser() user: AuthPayload
  ) {
    const result = await this.fetchAccountOverviewUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      overview: {
        total_bookings: result.value.totalBookings,
        total_active_booking: result.value.totalActiveBooking,
        total_earning: result.value.totalEarning
      }
    };
  }

}