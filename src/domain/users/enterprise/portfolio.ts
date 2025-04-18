import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface PortfolioProps {
  title: string
  description: string
  serviceProviderId: UniqueEntityID
  image1: string | null
  image2: string | null
  image3: string | null
  image4: string | null
  image5: string | null
  image6: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Portfolio extends Entity<PortfolioProps> {
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get image1() {
    return this.props.image1;
  }
  get image2() {
    return this.props.image2;
  }
  get image3() {
    return this.props.image3;
  }
  get image4() {
    return this.props.image4;
  }
  get image5() {
    return this.props.image5;
  }
  get image6() {
    return this.props.image6;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<PortfolioProps, "createdAt">, id?: UniqueEntityID) {
    const otp = new Portfolio({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return otp;
  }
}
