import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface EmailPhoneUpdateProps {
  emailOrPhone: string
  userId: UniqueEntityID
  type: "Email" | "Phone"
  createdAt?: Date | null
  updatedAt?: Date | null
}

export class EmailPhoneUpdate extends Entity<EmailPhoneUpdateProps> {
  get emailOrPhone() {
    return this.props.emailOrPhone;
  }
  get type() {
    return this.props.type;
  }
  get userId() {
    return this.props.userId;
  }
  get createdAt(){
    return this.props.createdAt;
  }
  get updatedAt(){
    return this.props.updatedAt;
  }

  static create(props: EmailPhoneUpdateProps, id?: UniqueEntityID) {
    const emailPhoneUpdate = new EmailPhoneUpdate(props, id);

    return emailPhoneUpdate;
  }
}
