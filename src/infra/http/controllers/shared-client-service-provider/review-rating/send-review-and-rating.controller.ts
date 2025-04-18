import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Param,
  Headers
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
import { SendReviewAndRatingUseCase } from "@/domain/work/application/use-case/booking/send-review-and-rating";
import { ValidationService } from "../../../pipes/validation.service";

const sendReviewAndRatingBodySchema = z.object({
  stars: z.number({
    invalid_type_error: "review.stars.invalid_type_error",
    required_error: "review.stars.invalid_type_error"
  }).min(1).max(5),
  feedback: z.string({
    invalid_type_error: "review.feedback.invalid_type_error",
    required_error: "review.feedback.invalid_type_error"
  }).optional().default("Sem feedback"),
});

type SendReviewAndRatingBodySchema = z.infer<typeof sendReviewAndRatingBodySchema>

@ApiTags("Bookings")
@Controller("/booking")
@UseGuards(JwtAuthGuard)
export class SendReviewAndRatingController {
  constructor(
    private sendReviewAndRating: SendReviewAndRatingUseCase,
    private validation: ValidationService
  ) { }

  @Post(":bookingId/review_rating")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string,
    @Body() data: SendReviewAndRatingBodySchema
  ) {
    try {
      await this.validation.validateData(sendReviewAndRatingBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.sendReviewAndRating.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      stars: data.stars,
      feedback: data.feedback,
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