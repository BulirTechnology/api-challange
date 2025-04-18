import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface AddressProps {
  userId: UniqueEntityID
  name: string
  line1: string
  line2: string
  latitude: number
  longitude: number
  isPrimary: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class Address extends Entity<AddressProps> {
  get name() {
    return this.props.name;
  }
  get isPrimary() {
    return this.props.isPrimary;
  }
  get line1() {
    return this.props.line1;
  }
  get line2() {
    return this.props.line2;
  }
  get latitude() {
    return this.props.latitude;
  }
  get longitude(){
    return this.props.longitude;
  }
  get userId(){
    return this.props.userId;
  }
  get createdAt(){
    return this.props.createdAt;
  }
  get updatedAt(){
    return this.props.updatedAt;
  }

  static create(props: Optional<AddressProps, "createdAt">, id?: UniqueEntityID) {
    const address = new Address({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id);

    return address;
  }
}
