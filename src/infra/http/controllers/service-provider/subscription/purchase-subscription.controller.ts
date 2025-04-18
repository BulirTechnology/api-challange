import {
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Param,
  HttpException
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { InsufficientBalanceError } from "@/domain/payment/application/use-case/errors/insufficient-balance";
import { PurchaseSubscriptionUseCase } from "@/domain/subscriptions/applications/use-cases/subscription/purchase-subscription";
import { HttpStatusCode } from "axios";

@ApiTags("Subscriptions")
@Controller("/subscriptions")
@UseGuards(JwtAuthGuard)
export class PurchaseSubscriptionPlanController {
  constructor(
    private purchaseSubscription: PurchaseSubscriptionUseCase
  ) { }

  @Post("plan/:subscriptionPlanId/purchase")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Param("subscriptionPlanId") planId: string
  ) {
    const response = await this.purchaseSubscription.execute({
      userId: user.sub,
      planId
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