import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { FetchUserTransactionHistoryUseCase } from "@/domain/payment/application/use-case/fetch-user-transaction-history";
import { TransactionPresenter } from "@/infra/http/presenters/transaction-presenter";
import { z } from "zod";

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

type QueryParams = {
  page: PageQueryParamSchema,
  per_page: PageQueryParamSchema
}

@ApiTags("Wallet")
@Controller("/wallet")
export class FetchWalletTransactionHistoryController {
  constructor(
    private FetchUserTransactionHistoryUseCase: FetchUserTransactionHistoryUseCase
  ) { }

  @Get("transactions")
  @UseGuards(JwtAuthGuard)
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QueryParams,
    @Headers() headers: Record<string, string>
  ) {
    const result = await this.FetchUserTransactionHistoryUseCase.execute({
      userId: user.sub,
      page: isNaN(query.page) ? 1 : query.page,
      perPage: isNaN(query.per_page) ? 10 : query.per_page,
      language: headers["accept-language"] == "en" ? "en" : "pt",
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const meta = result.value.meta;

    return {
      transactions: result.value?.transactions.map(TransactionPresenter.toHTTP),
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