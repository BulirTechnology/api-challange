import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";

import { z } from "zod";

import { ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchServiceProviderBookingsUseCase } from "@/domain/work/application/use-case/booking/service-provider/service-provider-fetch-booking";
import { BookingPresenter } from "@/infra/http/presenters/booking-presenter";
import { EnvService } from "@/infra/environment/env.service";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .refine((value) => !isNaN(Number(value)), {
    message: "Invalid number format",
  })
  .transform(Number).pipe(
    z.number().min(1)
  );

const statusQueryParamSchema = z
  .enum(["PENDING", "ACTIVE", "COMPLETED", "EXPIRED", "DISPUTE"])
  .default("PENDING")
  .optional();

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type StatusQueryParamSchema = z.infer<typeof statusQueryParamSchema>

type QuerySearch = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
  status: StatusQueryParamSchema
}

@ApiTags("Bookings")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class FetchServiceProviderBookingController {
  constructor(
    private env: EnvService,
    private fetchClientBookingsUseCase: FetchServiceProviderBookingsUseCase
  ) { }

  @Get("bookings")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QuerySearch
  ) {
    const result = await this.fetchClientBookingsUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      status: query.status ?? "PENDING",
      userId: user.sub
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      bookings: result.value?.bookings.map(item => BookingPresenter.toHTTP(item, this.env.get("STORAGE_URL"))),
      meta: {
        total: meta.total,
        last_page: meta.lastPage,
        current_page: meta.currentPage,
        per_page: meta.perPage,
        prev: meta.prev,
        next: meta.next,
      },
      information: {
        pending: result.value.information.pending,
        active: result.value.information.active,
        completed: result.value.information.completed,
        expired: result.value.information.expired,
        in_dispute: result.value.information.inDispute
      }
    };
  }

}