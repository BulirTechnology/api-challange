import {
  Body,
  Controller,
  Post,
  ConflictException,
  BadRequestException,
  Headers,
} from "@nestjs/common";

import { z } from "zod";

import { RegisterClientUseCase } from "@/domain/users/application/use-cases/client/register-client";
import { AccountAlreadyExistsError } from "@/domain/users/application/use-cases/errors/account-already-exists-error";
import { Public } from "@/infra/auth/public";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { ClientPresenter } from "../../presenters/client-presenter";
import { ValidationService } from "../../pipes/validation.service";

const createClientBodySchema = z.object({
  first_name: z.string({
    invalid_type_error: "user.first_name.invalid_type_error",
    required_error: "user.first_name.invalid_type_error",
  }),
  last_name: z.string({
    invalid_type_error: "user.last_name.invalid_type_error",
    required_error: "user.last_name.invalid_type_error",
  }),
  email: z
    .string({
      invalid_type_error: "user.email.invalid_type_error",
      required_error: "user.email.invalid_type_error",
    })
    .email({
      message: "Informe um e-mail valido",
    }),
  password: z.string({
    invalid_type_error: "user.password.invalid_type_error",
    required_error: "user.password.invalid_type_error",
  }),
  referred_by: z
    .string({
      invalid_type_error: "user.referred_by.invalid_type_error",
      required_error: "user.referred_by.invalid_type_error",
    })
    .optional(),
  phone_number: z
    .string({
      invalid_type_error: "user.phone_number.invalid_type_error",
      required_error: "user.phone_number.invalid_type_error",
    })
    .refine((value) => {
      const angolaPhoneNumberPattern = /^9\d{8}$/;
      return angolaPhoneNumberPattern.test(value);
    }),
});

type CreateClientBodySchema = z.infer<typeof createClientBodySchema>;

@ApiTags("Clients")
@Controller("/clients")
export class RegisterClientController {
  constructor(
    private registerClient: RegisterClientUseCase,
    private validation: ValidationService
  ) {}

  @Post()
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: CreateClientBodySchema
  ) {
    try {
      await this.validation.validateData(createClientBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.registerClient.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email.toLowerCase(),
      phoneNumber: data.phone_number,
      password: data.password,
      referredBy: data.referred_by ? data.referred_by : null,
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == AccountAlreadyExistsError)
        throw new ConflictException({
          field: error.field,
          message: error.message,
          error: "Conflict",
          status_code: 409,
        });

      throw new BadRequestException({
        message: error.message,
        error: "Bad Request",
        status_code: 409,
        field: error.field,
      });
    }

    return {
      client: ClientPresenter.toHTTP(response.value.client),
    };
  }
}
