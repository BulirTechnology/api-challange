import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { GenderProps, UserState } from "./user";

export interface ClientProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bornAt: Date | null;
  gender?: GenderProps;
  address?: [];
  state: UserState;
  userId: UniqueEntityID;
  isEmailValidated?: boolean;
  isPhoneNumberValidated?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class Client extends Entity<ClientProps> {
  get firstName() {
    return this.props.firstName;
  }
  get lastName() {
    return this.props.lastName;
  }
  get email() {
    return this.props.email;
  }
  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get isEmailValidated() {
    return this.props.isEmailValidated;
  }
  get isPhoneNumberValidated() {
    return this.props.isPhoneNumberValidated;
  }
  get state() {
    return this.props.state;
  }
  get gender() {
    return this.props.gender;
  }
  get bornAt() {
    return this.props.bornAt;
  }
  get userId() {
    return this.props.userId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: ClientProps, id?: UniqueEntityID) {
    const client = new Client(
      {
        ...props,
        bornAt: props.bornAt ?? null,
      },
      id
    );

    return client;
  }
}
