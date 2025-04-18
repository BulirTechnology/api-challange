import {
  Body,
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Patch,
  Param,
  ConflictException,
  Headers,
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";

import { InvalidAddressError } from "@/domain/users/application/use-cases/errors/invalid-address-error";
import { UpdateUserAddressUseCase } from "@/domain/users/application/use-cases/user/address/update-user-address";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const updateUserAddressBodySchema = z.object({
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
  })
});

type UpdateUserAddressBodySchema = z.infer<typeof updateUserAddressBodySchema>

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdateUserAddressController {
  constructor(
    private updateUserAddress: UpdateUserAddressUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Patch("addresses/:addressId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("addressId") addressId: string,
    @Body() data: UpdateUserAddressBodySchema
  ) {
    try {
      await this.validation.validateData(updateUserAddressBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateUserAddress.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      addressId,
      address: {
        latitude: data.latitude,
        line1: data.line1,
        line2: data.line2,
        longitude: data.longitude,
        name: data.name
      }
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else if (error.constructor == InvalidAddressError)
        throw new ConflictException(this.i18n.t("errors.user.invalid_address", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}