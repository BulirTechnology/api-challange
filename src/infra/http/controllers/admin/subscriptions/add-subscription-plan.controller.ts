import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { AddSubscriptionPlantUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/add-subscription-plan";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { Public } from "@/infra/auth/public";


const addSubscriptionPlanBodySchema = z.object({
  name: z.string({
    invalid_type_error: "Nome plano",
    required_error: "Nome plano"
  }),
  description: z.string({
    invalid_type_error: "Descricao",
    required_error: "Descricao"
  }),
  price: z.number({
    invalid_type_error: "Preco",
    required_error: "Preco"
  }),
  duration: z.number({
    invalid_type_error: "Duracao",
    required_error: "Duracao"
  }),
  discount_type: z.enum(["FIXED", "TIERED"], {
    invalid_type_error: "Tipo disconto: FIXED | TIERED",
    required_error: "Tipo disconto: FIXED | TIERED"
  }),
  credits_per_job: z.number({
    invalid_type_error: "Credits per jobs",
    required_error: "Credits per jobs"
  }),
  roll_over_credit: z.number({
    invalid_type_error: "Roll over credit",
    required_error: "Roll over credit"
  }),
  is_default: z.boolean(),
  benefits: z.array(z.string()),
  discount_value: z.number({
    invalid_type_error: "Disconto",
    required_error: "Disconto"
  }).optional().default(0),
});

type AddSubscriptionPlanBodySchema = z.infer<typeof addSubscriptionPlanBodySchema>

@ApiTags("Subscriptions")
@Controller("/subscriptions")
@Public()
export class AddSubscriptionPlanController {
  constructor(
    private addSubscriptionPlan: AddSubscriptionPlantUseCase,
    private validation: ValidationService
  ) { }

  @Post("plans")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Body() data: AddSubscriptionPlanBodySchema
  ) {
    try {
      await this.validation.validateData(addSubscriptionPlanBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addSubscriptionPlan.execute({
      creditsPerJob: data.credits_per_job,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      duration: data.duration,
      name: data.name,
      rollOverCredit: data.roll_over_credit,
      isDefault: data.is_default,
      price: data.price,
      benefits: data.benefits
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }
  }
}