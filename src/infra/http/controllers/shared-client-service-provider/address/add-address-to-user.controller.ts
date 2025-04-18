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

import { AddAddressToUserUseCase } from "@/domain/users/application/use-cases/user/address/add-address-to-user";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { AddressPresenter } from "../../../presenters/address-presenter";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const addAddressToUserBodySchema = z.object({
  name: z.string({
    invalid_type_error: "address.name.invalid_type_error",
    required_error: "address.name.invalid_type_error"
  }),
  line1: z.string({
    invalid_type_error: "address.line1.invalid_type_error",
    required_error: "address.line1.invalid_type_error"
  }),
  line2: z.string({
    invalid_type_error: "address.line2.invalid_type_error",
    required_error: "address.line2.invalid_type_error"
  }),
  latitude: z.number({
    invalid_type_error: "address.latitude.invalid_type_error",
    required_error: "address.latitude.invalid_type_error"
  }),
  longitude: z.number({
    invalid_type_error: "address.longitude.invalid_type_error",
    required_error: "address.longitude.invalid_type_error"
  }),
  is_primary: z.boolean().default(false)
});

type AddAddressToUserBodySchema = z.infer<typeof addAddressToUserBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class AddAddressToUserController {
  constructor(
    private addAddressToUser: AddAddressToUserUseCase,
    private validation: ValidationService
  ) { }

  @Post("addresses")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: AddAddressToUserBodySchema
  ) {
    try {
      await this.validation.validateData(addAddressToUserBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }
    console.log("valod do data: ", data)
    const response = await this.addAddressToUser.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      address: {
        name: data.name,
        line1: data.line1,
        line2: data.line2,
        latitude: data.latitude,
        longitude: data.longitude,
        isPrimary: data.is_primary ? data.is_primary : false
      }
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException("Invalid promotion code");
    }

    return {
      address: AddressPresenter.toHTTP(response.value.address)
    };
  }
}