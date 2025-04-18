import { PaymentMethod } from "@/domain/users/enterprise/payment-method";

export class PaymentMethodPresenter {
  static toHTTP(paymentMethod: PaymentMethod) {
    return {
      id: paymentMethod.id.toString(),
      bank_holder_name: paymentMethod.bankHolderName,
      bank_name: paymentMethod.bankName,
      city: paymentMethod.city,
      iban: paymentMethod.iban,
    };
  }
}