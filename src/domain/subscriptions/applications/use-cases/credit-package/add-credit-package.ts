import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";
import { } from "@/core/errors";

import { CreditPackage } from "@/domain/subscriptions/enterprise";
import { CreditPackageRepository } from "../../repositories";

interface AddCreditPackageUseCaseCaseRequest {
  amount: number
  name: string
  totalCredit: number
  vat: number
}

type AddCreditPackageUseCaseCaseResponse = Either<
  ResourceNotFoundError,
  {
    creditPackage: CreditPackage,
  }
>

@Injectable()
export class AddCreditPackageUseCase {
  constructor(
    private creditPackageRepository: CreditPackageRepository
  ) { }

  async execute({
    amount,
    name,
    totalCredit,
    vat
  }: AddCreditPackageUseCaseCaseRequest): Promise<AddCreditPackageUseCaseCaseResponse> {
    const creditPackage = await this.creditPackageRepository.findByName(name)

    if (creditPackage) {
      return left(new InvalidResourceError("Already exist an credit package with this name"))
    }

    const discount = CreditPackage.create({
      amount,
      name,
      vat,
      status: "DRAFT",
      totalCredit,
      updatedAt: new Date(),
      createdAt: new Date()
    });

    const planCreated = await this.creditPackageRepository.create(discount);

    return right({
      creditPackage: planCreated,
    });
  }
}
