import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  PaymentMethodsRepository
} from "../../../repositories";

import { PaymentMethod } from "../../../../enterprise";

interface EditPaymentMethodToUserUseCaseRequest {
  language: "en" | "pt"
  userId: string
  paymentMethodId: string
  paymentMethod: {
    bankName: string
    bankHolderName: string
    city: string
    iban: string
  },
}

type EditPaymentMethodToUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class EditPaymentMethodToUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private paymentMethodsRepository: PaymentMethodsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    paymentMethodId,
    paymentMethod,
    userId
  }: EditPaymentMethodToUserUseCaseRequest): Promise<EditPaymentMethodToUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(
        new ResourceNotFoundError(
          this.i18n.t(
            "errors.user.not_found",
            { lang: I18nContext.current()?.lang }
          )
        )
      );
    }

    const updatePaymentMethod = PaymentMethod.create({
      iban: paymentMethod.iban,
      city: paymentMethod.city,
      bankHolderName: paymentMethod.bankHolderName,
      bankName: paymentMethod.bankName,
      userId: user.id,
    }, new UniqueEntityID(paymentMethodId));

    await this.paymentMethodsRepository.update(paymentMethodId, updatePaymentMethod);

    return right({
      message: this.i18n.t(
        "errors.payment_method.payment_method_created",
        { lang: I18nContext.current()?.lang }
      )
    });
  }
}
