import {
  Body,
  Controller,
  Param,
  Put,
  NotFoundException,
  BadRequestException,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { UpdateAddressUseCase } from "@/domain/users/application/use-cases/user/address/update-address-draft-only-for-test";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { I18nContext, I18nService } from "nestjs-i18n";

const updateAddressBodySchema = z.object({
  addressId: z.string({
    invalid_type_error: "address.id.invalid_type_error",
    required_error: "address.id.invalid_type_error"
  }),
  address: z.object({
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
  }, {
    invalid_type_error: "user.address.invalid_type_error",
    required_error: "user.address.invalid_type_error"
  })
});

type UpdateAddressBodySchema = z.infer<typeof updateAddressBodySchema>

@ApiTags("Users")
@Controller("/users")
export class UpdateAddressController {
  constructor(
    private updateAddress: UpdateAddressUseCase,
    private validation: ValidationService,
    private readonly i18n: I18nService
  ) { }

  @Put(":id/addresses/:addressId")
  @Public()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Param("id") userId: string,
    @Body() data: UpdateAddressBodySchema
  ) {
    try {
      await this.validation.validateData(updateAddressBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateAddress.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId,
      address: data.address,
      addressId: data.addressId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(this.i18n.t("errors.user.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}