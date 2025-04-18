import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { ApiTags } from "@nestjs/swagger";

import { AcceptQuotationUseCase } from "@/domain/work/application/use-case/jobs/quotation/accept-quotation";
import { PromotionNotFoundError } from "@/domain/users/application/use-cases/errors/promotion-not-found-error";

import { ResourceNotFoundError } from "@/core/errors";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const clientAcceptQuotationBodySchema = z.object({
  promotion_id: z.string({
    invalid_type_error: "quotation.promotion_id.invalid_type_error",
    required_error: "quotation.promotion_id.invalid_type_error"
  }).optional().default(""),
});

type ClientAcceptQuotationBodySchema = z.infer<typeof clientAcceptQuotationBodySchema>

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class AcceptQuotationController {
  constructor(
    private acceptQuotation: AcceptQuotationUseCase,
    private validation: ValidationService
  ) { }

  @Put(":jobId/quotations/:quotationId/accept")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string,
    @Param("quotationId") quotationId: string,
    @Body() data: ClientAcceptQuotationBodySchema
  ) {
    try {
      await this.validation.validateData(clientAcceptQuotationBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.acceptQuotation.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      jobId,
      quotationId,
      promotionId: data.promotion_id
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === PromotionNotFoundError)
        throw new NotFoundException("Promotion code not found");
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}