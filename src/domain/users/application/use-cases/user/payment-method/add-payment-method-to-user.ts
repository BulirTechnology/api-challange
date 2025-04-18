import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  UsersRepository,
  PaymentMethodsRepository
} from "../../../repositories";
import { PaymentMethod } from "../../../../enterprise";

interface AddPaymentMethodToUserUseCaseRequest {
  language: "en" | "pt"
  userId: string
  paymentMethod: {
    bankName: string
    bankHolderName: string
    city: string
    iban: string
  },
}

type AddPaymentMethodToUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
  }
>

@Injectable()
export class AddPaymentMethodToUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private paymentMethodsRepository: PaymentMethodsRepository,
    private readonly i18n: I18nService
  ) { }

  async execute({
    paymentMethod,
    userId
  }: AddPaymentMethodToUserUseCaseRequest): Promise<AddPaymentMethodToUserUseCaseResponse> {
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

    const hasPaymentAddress = await this.paymentMethodsRepository.findByUserId(userId);

    if (hasPaymentAddress) {
      const paymentToUpdate = PaymentMethod.create({
        iban: paymentMethod.iban,
        city: paymentMethod.city,
        bankHolderName: paymentMethod.bankHolderName,
        bankName: paymentMethod.bankName,
        userId: user.id,
      }, hasPaymentAddress.id);
      await this.paymentMethodsRepository.update(hasPaymentAddress.id.toString(), paymentToUpdate);

      return right({
        message: this.i18n.t(
          "errors.payment_method.payment_method_created",
          { lang: I18nContext.current()?.lang }
        )
      });
    }

    const createPaymentMethod = PaymentMethod.create({
      iban: paymentMethod.iban,
      city: paymentMethod.city,
      bankHolderName: paymentMethod.bankHolderName,
      bankName: paymentMethod.bankName,
      userId: user.id,
    });

    await this.paymentMethodsRepository.create(createPaymentMethod);

    return right({
      message: this.i18n.t(
        "errors.payment_method.payment_method_created",
        { lang: I18nContext.current()?.lang }
      )
    });
  }
}
