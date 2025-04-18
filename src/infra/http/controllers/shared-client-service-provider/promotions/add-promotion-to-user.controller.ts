import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  ConflictException,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { InvalidPromotionCodeError } from "@/domain/users/application/use-cases/errors/invalid-promotion-code-error";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { PromotionAlreadyInUseError } from "@/domain/users/application/use-cases/errors/promotion-already-in-use-error";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { UserPromotionPresenter } from "@/infra/http/presenters/user-promotion-presenter";
import { AddPromotionToUserUseCase } from "@/domain/users/application/use-cases/promotion/add-promotion-to-user";

const addPromotionToUserBodySchema = z.object({
  promotion_code: z.string({
    invalid_type_error: "promotion.name.invalid_type_error",
    required_error: "promotion.name.invalid_type_error"
  })
});

type AddPromotionToUserBodySchema = z.infer<typeof addPromotionToUserBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AddPromotionToUserController {
  constructor(
    private addPromotionToUser: AddPromotionToUserUseCase,
    private validation: ValidationService
  ) { }

  @Post("promotions")
  @ApiResponse({ status: 201, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AddPromotionToUserBodySchema
  ) {
    try {
      await this.validation.validateData(addPromotionToUserBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addPromotionToUser.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      promotionCode: data.promotion_code
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);
      else if (error.constructor == PromotionAlreadyInUseError)
        throw new ConflictException("Promotion code already in use");
      else if (error.constructor == InvalidPromotionCodeError)
        throw new BadRequestException("Invalid promotion code");
    }

    if (response.isRight())
      return {
        promotion: UserPromotionPresenter.toHTTP(response.value.promotion)
      };

    throw new BadRequestException("Invalid promotion code");
  }
}