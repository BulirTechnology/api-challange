import {
  Controller,
  BadRequestException,
  UseGuards,
  Param,
  Get,
  Headers
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchReviewAndRatingUseCase } from "@/domain/work/application/use-case/booking/fetch-review-and-rating";

@ApiTags("Bookings")
@Controller("/bookings")
@UseGuards(JwtAuthGuard)
export class FetchReviewAndRatingController {
  constructor(
    private fetchReviewAndRating: FetchReviewAndRatingUseCase
  ) { }

  @Get(":bookingId/review_rating")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string
  ) { 
    const response = await this.fetchReviewAndRating.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      bookingId,
    });

    if (response.isLeft()) {
      throw new BadRequestException();
    }

    return {
      data: {
        client: response.value.data.client,
        service_provider: response.value.data.serviceProvider
      },
    };
  }
}