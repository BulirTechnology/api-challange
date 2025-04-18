import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface OtpProps {
  code: string
  userId: UniqueEntityID
  isVerified: boolean
  expiresAt: Date
  createdAt: Date
  verificationType: "Email" | "PhoneNumber" | "Password"
  updatedAt?: Date | null
}

export class Otp extends Entity<OtpProps> {
  get code() {
    return this.props.code;
  }
  get userId() {
    return this.props.userId;
  }
  get isVerified() {
    return this.props.isVerified;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get verificationType() {
    return this.props.verificationType;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  
  static create(props: Optional<OtpProps, "createdAt">, id?: UniqueEntityID) {

    const otp = new Otp({
      code: props.code,
      expiresAt: props.expiresAt,
      isVerified: props.isVerified,
      userId: props.userId,
      verificationType: props.verificationType,
      createdAt: props.createdAt ?? new Date()
    }, id);

    return otp;
  }
}
