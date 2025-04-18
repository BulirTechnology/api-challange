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
import { SendRequestToStartBookingUseCase } from "@/domain/work/application/use-case/booking/service-provider/send-request-to-start-booking";

@ApiTags("Bookings")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class SendRequestToStartBookingController {
  constructor(
    private sendRequestToStartBooking: SendRequestToStartBookingUseCase
  ) { }

  @Post("bookings/:bookingId/start")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string
  ) {
    const response = await this.sendRequestToStartBooking.execute({
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