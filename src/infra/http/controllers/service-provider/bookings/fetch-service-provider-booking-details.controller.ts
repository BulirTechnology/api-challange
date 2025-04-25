import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { BookingPresenter } from "@/infra/http/presenters/booking-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { FetchServiceProviderBookingDetailsUseCase } from "@/domain/work/application/use-case/booking/service-provider/service-provider-fetch-booking-details";
import { RolesGuard } from "@/infra/auth/role.guard";
import { Roles } from "@/infra/auth/decorators/role.decorator";
import { Role } from "@/infra/auth/enums/role.enum";

@ApiTags("Bookings")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class FetchServiceProviderBookingDetailsController {
  constructor(
    private env: EnvService,
    private fetchDetails: FetchServiceProviderBookingDetailsUseCase
  ) { }

  @Get("bookings/:bookingId")
  @Roles(Role.SERVICE_PROVIDER)
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("bookingId") bookingId: string
  ) {
    
    const result = await this.fetchDetails.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      bookingId,
      userId: user.sub
    });
    console.log("bookingId: ", bookingId, result)
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    console.log("dados do booking: ", result.value.booking)
    return {
      booking: BookingPresenter.toHTTP(result.value.booking, this.env.get("STORAGE_URL")),
    };
  }

}