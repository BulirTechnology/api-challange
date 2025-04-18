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
import { StartFileDisputeUseCase } from "@/domain/work/application/use-case/booking/start-file-dispute";
import { ValidationService } from "../../../pipes/validation.service";

const startFileDisputeBodySchema = z.object({
  description: z.string({
    invalid_type_error: "dispute.client_reason_description.invalid_type_error",
    required_error: "dispute.client_reason_description.invalid_type_error"
  }),
  file_dispute_reason_id: z.string({
    invalid_type_error: "dispute.client_reason.invalid_type_error",
    required_error: "dispute.client_reason.invalid_type_error"
  }),
});

type StartFileDisputeBodySchema = z.infer<typeof startFileDisputeBodySchema>

@ApiTags("Bookings")
@Controller("/bookings")
@UseGuards(JwtAuthGuard)
export class StartFileDisputeController {
  constructor(
    private startFileDispute: StartFileDisputeUseCase,
    private validation: ValidationService
  ) { }

  @Post(":bookingId/dispute")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string,
    @Body() data: StartFileDisputeBodySchema
  ) {
    try {
      await this.validation.validateData(startFileDisputeBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.startFileDispute.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      description: data.description,
      fileDisputeReasonId: data.file_dispute_reason_id,
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