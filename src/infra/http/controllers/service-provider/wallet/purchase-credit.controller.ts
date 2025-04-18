import {
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Body,
  HttpException
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
import { PurchaseCreditUseCase } from "@/domain/payment/application/use-case/purchase-credit";
import { InsufficientBalanceError } from "@/domain/payment/application/use-case/errors/insufficient-balance";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { HttpStatusCode } from "axios";

const purchaseCreditBodySchema = z.object({
  credit: z.enum(["10", "40", "70"], {
    invalid_type_error: "credit.credit.invalid_type_error",
    required_error: "credit.credit.invalid_type_error"
  }),
});

type PurchaseCreditBodySchema = z.infer<typeof purchaseCreditBodySchema>

@ApiTags("Wallet")
@Controller("/credits")
@UseGuards(JwtAuthGuard)
export class PurchaseCreditController {
  constructor(
    private purchaseCredit: PurchaseCreditUseCase,
    private validation: ValidationService
  ) { }

  @Post("purchase")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: PurchaseCreditBodySchema
  ) {
    try {
      await this.validation.validateData(purchaseCreditBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.purchaseCredit.execute({
      userId: user.sub,
      credit: data.credit
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);
      else if (error.constructor === InsufficientBalanceError)
        throw new HttpException("Insufficient wallet Balance", HttpStatusCode.PaymentRequired);

      throw new BadRequestException("");
    }
  }
}