import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { AddPaymentMethodToUserUseCase } from "@/domain/users/application/use-cases/user/payment-method/add-payment-method-to-user";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const addPaymentMethodBodySchema = z.object({
  bank_name: z.string({
    invalid_type_error: "payment_method.bank_name.invalid_type_error",
    required_error: "payment_method.bank_name.invalid_type_error"
  }),
  bank_holder_name: z.string({
    invalid_type_error: "payment_method.bank_holder_name.invalid_type_error",
    required_error: "payment_method.bank_holder_name.invalid_type_error"
  }),
  iban: z.string({
    invalid_type_error: "payment_method.iban.invalid_type_error",
    required_error: "payment_method.iban.invalid_type_error"
  }),
  city: z.string({
    invalid_type_error: "payment_method.city.invalid_type_error",
    required_error: "payment_method.city.invalid_type_error"
  }),
});

type AddAddressToUserBodySchema = z.infer<typeof addPaymentMethodBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AddPaymentMethodToUserController {
  constructor(
    private addPaymentMethodToUserUseCase: AddPaymentMethodToUserUseCase,
    private validation: ValidationService
  ) { }

  @Post("payment-method")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AddAddressToUserBodySchema
  ) {
    try {
      await this.validation.validateData(addPaymentMethodBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addPaymentMethodToUserUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      paymentMethod: {
        bankName: data.bank_name,
        bankHolderName: data.bank_holder_name,
        city: data.city,
        iban: data.iban
      }
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }
  }
}