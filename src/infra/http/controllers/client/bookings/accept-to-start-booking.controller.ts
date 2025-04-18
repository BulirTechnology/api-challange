import {
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Param,
  Headers
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AcceptToStartBookingUseCase } from "@/domain/work/application/use-case/booking/client/accept-to-start-booking";

@ApiTags("Bookings")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class AcceptToStartBookingController {
  constructor(
    private acceptStartBooking: AcceptToStartBookingUseCase
  ) { }

  @Post("bookings/:bookingId/accept_start")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string
  ) {
    const response = await this.acceptStartBooking.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      bookingId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException("");
    }
  }
}