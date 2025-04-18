import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Param,
  Headers,
  ConflictException
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ServiceProviderSendQuotationUseCase } from "@/domain/work/application/use-case/jobs/quotation/service-provider-send-quotation";
import { InsufficientCreditBalanceError } from "@/domain/payment/application/use-case/errors/insufficient-credit-balance";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { HavePendingQuotationError } from "@/domain/payment/application/use-case/errors/have-pending-quotation";

const serviceProviderSendQuotationBodySchema = z.object({
  budget: z.number({
    invalid_type_error: "quotation.send_quotation.budget.invalid_type_error",
    required_error: "quotation.send_quotation.budget.invalid_type_error"
  }),
  date: z.string({
    invalid_type_error: "quotation.send_quotation.date.invalid_type_error",
    required_error: "quotation.send_quotation.date.invalid_type_error"
  }).pipe(z.coerce.date()),
  cover: z.string({
    invalid_type_error: "quotation.send_quotation.cover.invalid_type_error",
    required_error: "quotation.send_quotation.cover.invalid_type_error"
  }),
});

type ServiceProviderSendQuotationBodySchema = z.infer<typeof serviceProviderSendQuotationBodySchema>

@ApiTags("Users")
@Controller("/service-providers")
@UseGuards(JwtAuthGuard)
export class ServiceProviderSendQuotationController {
  constructor(
    private serviceProviderSendQuotation: ServiceProviderSendQuotationUseCase,
    private validation: ValidationService
  ) { }

  @Post("jobs/:jobId/quote")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string,
    @Body() data: ServiceProviderSendQuotationBodySchema
  ) {
    try {
      await this.validation.validateData(serviceProviderSendQuotationBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.serviceProviderSendQuotation.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      budget: data.budget,
      date: new Date(data.date),
      cover: data.cover,
      jobId
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);
      else if (error.constructor === InsufficientCreditBalanceError)
        throw new BadRequestException("Insufficient credit balance");
      else if (error.constructor === HavePendingQuotationError)
        throw new ConflictException("You have a pending quotation in this job");

      throw new BadRequestException("");
    }
  }
}