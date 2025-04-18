import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { BookingPresenter } from "@/infra/http/presenters/booking-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { FetchClientBookingDetailsUseCase } from "@/domain/work/application/use-case/booking/client/fetch-client-booking-details";

@ApiTags("Bookings")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class FetchClientBookingDetailsController {
  constructor(
    private env: EnvService,
    private fetchClientBookingDetails: FetchClientBookingDetailsUseCase
  ) { }

  @Get("bookings/:bookingId")
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string
  ) {
    const result = await this.fetchClientBookingDetails.execute({
      userId: user.sub,
      bookingId
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return {
      booking: BookingPresenter.toHTTP(result.value.booking, this.env.get("STORAGE_URL"))
    };
  }
}