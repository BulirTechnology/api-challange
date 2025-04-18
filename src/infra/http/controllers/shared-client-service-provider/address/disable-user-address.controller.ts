import {
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Param,
  ConflictException,
  Delete,
  Headers,
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { DeleteUserAddressUseCase } from "@/domain/users/application/use-cases/user/address/delete-user-address";
import { InvalidAddressError } from "@/domain/users/application/use-cases/errors/invalid-address-error";
import { I18nContext, I18nService } from "nestjs-i18n";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class DeleteUserAddressController {
  constructor(
    private updateUserAddress: DeleteUserAddressUseCase,
    private readonly i18n: I18nService
  ) { }

  @Delete("addresses/:addressId")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("addressId") addressId: string,
  ) {
    const result = await this.updateUserAddress.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      addressId,
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