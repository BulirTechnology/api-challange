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
import { FetchUserAddressesUseCase } from "@/domain/users/application/use-cases/user/address/fetch-user-addresses";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AddressPresenter } from "../../../presenters/address-presenter";

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

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class FetchUserAddressController {
  constructor(private fetchAddresses: FetchUserAddressesUseCase) { }

  @Get("addresses")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QuerySearch
  ) {
    const result = await this.fetchAddresses.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      userId: user.sub
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      addresses: result.value?.addresses.map(AddressPresenter.toHTTP),
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