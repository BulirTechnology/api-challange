import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { EnvService } from "@/infra/environment/env.service";
import { z } from "zod";
import { FetchClientServiceProviderByService } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-by-services";

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

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

type QuerySearch = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
}

@ApiTags("Clients")
@Controller("/clients")
@UseGuards(JwtAuthGuard)
export class FetchClientServiceProviderByServiceController {
  constructor(
    private env: EnvService,
    private fetchClientServiceProviderByService: FetchClientServiceProviderByService
  ) { }

  @Get("service-providers/:serviceId/by-services")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("serviceId") serviceId: string,
    @Query() query: QuerySearch
  ) {
    const result = await this.fetchClientServiceProviderByService.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      userId: user.sub,
      serviceId: serviceId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      data: result.value?.serviceProviders.map(item => ({
        id: item.id.toString(),
        first_name: item.firstName,
        last_name: item.lastName,
        email: item.email,
        born_at: item.bornAt,
        gender: item.gender,
        image1: item.profileUrl && item.profileUrl != "null" ? this.env.get("STORAGE_URL") + item.profileUrl : null,
        phone_number: item.phoneNumber,
        user_id: item.userId.toString(),
        is_email_validated: item.isEmailValidated,
        is_phone_number_validated: item.isPhoneNumberValidated,
        rating: item.rating,
        has_budget: item.hasBudget,
        has_certificate_by_bulir: item.hasCertificateByBulir,
        is_favorite: item.isFavorite,
      })),
      meta: {
        total: meta.total,
        last_page: meta.lastPage,
        current_page: meta.currentPage,
        per_page: meta.perPage,
        prev: meta.prev,
        next: meta.next,
      }
    };
  }

} 