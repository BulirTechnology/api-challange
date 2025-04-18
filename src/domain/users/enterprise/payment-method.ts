import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface PaymentMethodProps {
  userId: UniqueEntityID
  bankName: string
  bankHolderName: string
  city: string
  iban: string
}

export class PaymentMethod extends Entity<PaymentMethodProps> {
  get bankName() {
    return this.props.bankName;
  }
  get bankHolderName() {
    return this.props.bankHolderName;
  }
  get city() {
    return this.props.city;
  }
  get iban() {
    return this.props.iban;
  }
  get userId(){
    return this.props.userId;
  }

  static create(props: PaymentMethodProps, id?: UniqueEntityID) {
    const paymentMethod = new PaymentMethod({
      ...props,
    }, id);

    return paymentMethod;
  }
}
