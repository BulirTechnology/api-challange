import {
  Controller,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Param,
  Headers,
  Get
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchBookingFileDisputeUseCase } from "@/domain/work/application/use-case/booking/fetch-booking-file-dispute";
import { BookingFileDisputePresenter } from "../../../presenters/booking-file-dispute";

@ApiTags("Bookings")
@Controller("/bookings")
@UseGuards(JwtAuthGuard)
export class FetchBookingFileDisputeController {
  constructor(
    private fetchBookingFileDispute: FetchBookingFileDisputeUseCase
  ) { }

  @Get(":bookingId/dispute")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string
  ) {

    const response = await this.fetchBookingFileDispute.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      bookingId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }

    if (!response.value.dispute) throw new NotFoundException();

    return {
      dispute: BookingFileDisputePresenter.toHTTP(response.value.dispute)
    };
  }
}