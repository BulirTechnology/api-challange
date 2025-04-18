import {
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  Param,
  Headers
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ValidateReferralCodeUseCase } from "@/domain/users/application/use-cases/referral-code/validate-referral-code";
import { Public } from "@/infra/auth/public";

@ApiTags("Referrals")
@Controller("/referrals")
@Public()
export class ValidateReferralCodeController {
  constructor(
    private validateReferralCode: ValidateReferralCodeUseCase,
  ) { }

  @Post(":code/validate")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("code") referralCode: string
  ) {

    const response = await this.validateReferralCode.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      referralCode: referralCode,
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException("");
    }
  }
}