import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException
} from "@nestjs/common";

import { z } from "zod";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { Public } from "@/infra/auth/public";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { AddCreditPackageUseCase } from "@/domain/subscriptions/applications/use-cases/credit-package/add-credit-package";
import { CreditPackagePresenter } from "@/infra/http/presenters/credit-package-presenter";

const addCreditPackageBodySchema = z.object({
  name: z.string(),
  amount: z.number(),
  total_credit: z.number(),
  vat: z.number(),
});

type AddCreditPackageBodySchema = z.infer<typeof addCreditPackageBodySchema>

@ApiTags("Credit Package")
@Controller("/credit-packages")
@Public()
export class AddCreditPackageController {
  constructor(
    private addCreditPackage: AddCreditPackageUseCase,
    private validation: ValidationService
  ) { }

  @Post()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Body() data: AddCreditPackageBodySchema
  ) {
    try {
      await this.validation.validateData(addCreditPackageBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addCreditPackage.execute({
      amount: data.amount,
      name: data.name,
      totalCredit: data.total_credit,
      vat: data.vat
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }

    return {
      credit_package: CreditPackagePresenter.toHTTP(response.value.creditPackage)
    }
  }
}