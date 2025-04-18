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
import { FetchClientBookingsUseCase } from "@/domain/work/application/use-case/booking/client/client-fetch-booking";
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

const titleQueryParamSchema = z
  .string()
  .optional()
  .default("");

const statusQueryParamSchema = z
  .enum(["PENDING", "ACTIVE", "COMPLETED", "EXPIRED", "DISPUTE", ""])
  .default("")
  .optional();

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type StatusQueryParamSchema = z.infer<typeof statusQueryParamSchema>
type TitleQueryParamSchema = z.infer<typeof titleQueryParamSchema>

type Query = {
  page: PageQueryParamSchema,
  status: StatusQueryParamSchema,
  title: TitleQueryParamSchema
  per_page: PageQueryParamSchema
}

@ApiTags("Bookings")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class FetchClientBookingController {
  constructor(
    private env: EnvService,
    private fetchClientBookingsUseCase: FetchClientBookingsUseCase
  ) { }

  @Get("bookings")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: Query,
  ) {
    const result = await this.fetchClientBookingsUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      status: query.status ?? "",
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