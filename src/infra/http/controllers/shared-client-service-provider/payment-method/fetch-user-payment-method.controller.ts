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
import { PaymentMethodPresenter } from "../../../presenters/payment-method-presenter";
import { FetchUserPaymentMethodsUseCase } from "@/domain/users/application/use-cases/user/payment-method/fetch-user-payment-method";
import { I18nContext, I18nService } from "nestjs-i18n";

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

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class FetchUserPaymentMethodController {
  constructor(
    private fetchPaymentMethods: FetchUserPaymentMethodsUseCase,
    private readonly i18n: I18nService
  ) { }

  @Get("payment-method")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Query() query: QueryParams
  ) {
    const result = await this.fetchPaymentMethods.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      page: isNaN(query.page) ? 10 : query.page,
      userId: user.sub
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    if (!result.value.paymentMethods) {
      return {
        payment_methods: {},
        status: this.i18n.t("errors.payment_method.no_payment_method_created", {
          lang: I18nContext.current()?.lang
        })
      };
    }

    return {
      payment_methods: PaymentMethodPresenter.toHTTP(result.value.paymentMethods),
    };
  }

}