import {
  Body,
  Controller,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Put,
  Param,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { EditPaymentMethodToUserUseCase } from "@/domain/users/application/use-cases/user/payment-method/edit-payment-method-to-user";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const editPaymentMethodBodySchema = z.object({
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

type EditAddressToUserBodySchema = z.infer<typeof editPaymentMethodBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class EditPaymentMethodToUserController {
  constructor(
    private editPaymentMethodToUserUseCase: EditPaymentMethodToUserUseCase,
    private validation: ValidationService
  ) { }

  @Put("payment-method/:paymentMethodId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("paymentMethodId") paymentMethodId: string,
    @Body() data: EditAddressToUserBodySchema
  ) {
    try {
      await this.validation.validateData(editPaymentMethodBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.editPaymentMethodToUserUseCase.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      paymentMethodId,
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