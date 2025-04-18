import {
  Controller,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Patch,
  Param,
  ConflictException,
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

import { InvalidAddressError } from "@/domain/users/application/use-cases/errors/invalid-address-error";
import { SetUserAddressPrimaryUseCase } from "@/domain/users/application/use-cases/user/address/set-user-address-primary";
import { I18nContext, I18nService } from "nestjs-i18n";

@ApiTags("Users")
@Controller("/users")
@UseGuards(JwtAuthGuard)
export class SetUserAddressPrimaryController {
  constructor(
    private setUserAddressPrimary: SetUserAddressPrimaryUseCase,
    private readonly i18n: I18nService
  ) { }

  @Patch("addresses/:addressId/set-primary")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("addressId") addressId: string,
  ) {
    const result = await this.setUserAddressPrimary.execute({
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
        throw new ConflictException(this.i18n.t("errors.notification.not_found", {
          lang: I18nContext.current()?.lang
        }));
      else
        throw new BadRequestException(error.message);
    }
  }
}