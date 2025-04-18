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

import { ApiTags } from "@nestjs/swagger";
import { RejectQuotationUseCase } from "@/domain/work/application/use-case/jobs/quotation/reject-quotation";

import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const clientRejectQuotationBodySchema = z.object({
  reason: z.string({
    invalid_type_error: "quotation.client_reject_reason.invalid_type_error",
    required_error: "quotation.client_reject_reason.invalid_type_error"
  }),
  description: z.string({
    invalid_type_error: "quotation.client_reject_description.invalid_type_error",
    required_error: "quotation.client_reject_description.invalid_type_error"
  }),
});

type ClientRejectQuotationBodySchema = z.infer<typeof clientRejectQuotationBodySchema>

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class RejectQuotationController {
  constructor(
    private rejectQuotation: RejectQuotationUseCase,
    private validation: ValidationService,
  ) { }

  @Put(":jobId/quotations/:quotationId/reject")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string,
    @Param("quotationId") quotationId: string,
    @Body() data: ClientRejectQuotationBodySchema
  ) {
    try {
      await this.validation.validateData(clientRejectQuotationBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.rejectQuotation.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      jobId,
      quotationId,
      reasonId: data.reason,
      description: data.description
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}