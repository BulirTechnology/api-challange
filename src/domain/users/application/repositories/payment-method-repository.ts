import { PaymentMethod } from "../../enterprise/payment-method";

export abstract class PaymentMethodsRepository {
  abstract findById(id: string): Promise<PaymentMethod | null>
  abstract findByUserId(userId: string): Promise<PaymentMethod | null>
  abstract create(paymentMethod: PaymentMethod): Promise<void>
  abstract update(id: string, paymentMethod: PaymentMethod): Promise<void>
  abstract update(id: string, paymentMethod: PaymentMethod): Promise<void>
}
