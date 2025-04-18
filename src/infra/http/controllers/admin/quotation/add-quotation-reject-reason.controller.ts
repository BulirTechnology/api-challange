import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
  Headers
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { Public } from "@/infra/auth/public";
import { AddQuotationRejectReasonUseCase } from "@/domain/work/application/use-case/jobs/quotation-reject-reason/add-quotation-reject-reason";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { QuotationRejectReasonPresenter } from "@/infra/http/presenters/quotation-reject-reason-presenter";

const addQuotationRejectReasonBodySchema = z.object({
  value: z.string({
    invalid_type_error: "quotation.add_reject_reason.invalid_type_error",
    required_error: "quotation.add_reject_reason.invalid_type_error"
  }),
});

type AddQuotationRejectReasonBodySchema = z.infer<typeof addQuotationRejectReasonBodySchema>

@ApiTags("Reasons")
@Controller("/quotation")
@Public()
export class AddQuotationRejectReasonController {
  constructor(
    private addQuotationRejectReason: AddQuotationRejectReasonUseCase,
    private validation: ValidationService,
  ) { }

  @Post("reject_reasons")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: AddQuotationRejectReasonBodySchema
  ) {
    try {
      await this.validation.validateData(addQuotationRejectReasonBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addQuotationRejectReason.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      value: data.value,
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }

    return {
      quotation: QuotationRejectReasonPresenter.toHTTP(response.value.quotation)
    }
  }
}