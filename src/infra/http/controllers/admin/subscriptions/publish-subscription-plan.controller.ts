import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { PublishSubscriptionPlanUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/publish-subscription-plans";
import { Public } from "@/infra/auth/public";

@ApiTags("Subscriptions")
@Controller("/subscriptions")
@Public()
export class PublishSubscriptionPlansController {
  constructor(
    private publishSubscriptionPlansUseCase: PublishSubscriptionPlanUseCase
  ) { }

  @Get("plans/:subscriptionPlanId/publish")
  async handle(
    @Param("subscriptionPlanId") subscriptionPlanId: string
  ) {
    const result = await this.publishSubscriptionPlansUseCase.execute({
      subscriptionPlanId: subscriptionPlanId,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }
  }

}