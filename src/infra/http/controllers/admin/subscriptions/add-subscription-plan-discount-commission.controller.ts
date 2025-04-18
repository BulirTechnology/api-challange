import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { AddDiscountCommissionUseCase } from "@/domain/subscriptions/applications/use-cases/discount-commission/add-discount-commission";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { Public } from "@/infra/auth/public";

const addDiscountCommissionBodySchema = z.object({
  min_value: z.number({
    invalid_type_error: "job_cancel.add_value.invalid_type_error",
    required_error: "job_cancel.add_value.required_error"
  }),
  max_value: z.number({
    invalid_type_error: "job_cancel.add_value.invalid_type_error",
    required_error: "job_cancel.add_value.required_error"
  }),
  commission: z.number({
    invalid_type_error: "job_cancel.add_value.invalid_type_error",
    required_error: "job_cancel.add_value.required_error"
  }),
});

type AddDiscountCommissionBodySchema = z.infer<typeof addDiscountCommissionBodySchema>

@ApiTags("Subscriptions")
@Controller("/subscriptions")
@Public()
export class AddPublishSubscriptionPlanDiscountController {
  constructor(
    private addDiscountCommissionUseCase: AddDiscountCommissionUseCase,
    private validation: ValidationService
  ) { }

  @Post("plans/:subscriptionPlanId/discounts")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Body() data: AddDiscountCommissionBodySchema,
    @Param("subscriptionPlanId") subscriptionPlanId: string
  ) {
    try {
      await this.validation.validateData(addDiscountCommissionBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addDiscountCommissionUseCase.execute({
      commission: data.commission,
      maxValue: data.max_value,
      minValue: data.min_value,
      subscriptionPlanId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }
  }
}