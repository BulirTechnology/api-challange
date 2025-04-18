import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { CreatePromotionUseCase } from "@/domain/work/application/use-case/promotion/create-promotion";

import { z } from "zod";
import { Public } from "@/infra/auth/public";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { PromotionPresenter } from "@/infra/http/presenters/promotion-presenter";

const promotionsBodySchema = z.object({
  description: z.string({
    invalid_type_error: "promotion.description.invalid_type_error",
    required_error: "promotion.description.invalid_type_error"
  }),
  discount: z.number({
    invalid_type_error: "promotion.discount.invalid_type_error",
    required_error: "promotion.discount.invalid_type_error"
  }),
  max_allowed_user: z.number({
    invalid_type_error: "promotion.max_allowed_user.invalid_type_error",
    required_error: "promotion.max_allowed_user.invalid_type_error"
  }),
  name: z.string({
    invalid_type_error: "promotion.name.invalid_type_error",
    required_error: "promotion.name.invalid_type_error"
  }),
  promotion_for: z.enum(["Client", "ServiceProvider"], {
    invalid_type_error: "promotion.promotion_for.invalid_type_error",
    required_error: "promotion.promotion_for.invalid_type_error"
  }),
  promotion_type: z.enum(["Money", "Percentage"], {
    invalid_type_error: "promotion.promotion_type.invalid_type_error",
    required_error: "promotion.promotion_type.invalid_type_error"
  }),
  expires_at: z.string({
    invalid_type_error: "promotion.expires_at.invalid_type_error",
    required_error: "promotion.expires_at.invalid_type_error"
  }).pipe(z.coerce.date()),
});

type PromotionsBodySchema = z.infer<typeof promotionsBodySchema>

@ApiTags("Promotions")
@Controller("/promotions")
@Public()
//admin route
export class CreatePromotionController {
  constructor(
    private createPromotion: CreatePromotionUseCase,
    private validation: ValidationService
  ) { }

  @Post()
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: PromotionsBodySchema,
  ) {
    try {
      await this.validation.validateData(promotionsBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.createPromotion.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      description: data.description,
      discount: data.discount,
      maxAllowedUser: data.max_allowed_user,
      name: data.name,
      promotionFor: data.promotion_for,
      expiresAt: data.expires_at,
      promotionType: data.promotion_type
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      promotion: PromotionPresenter.toHTTP(result.value.promotion)
    }
  }
}