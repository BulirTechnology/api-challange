import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ServiceProps {
  title: string
  titleEn: string
  parentId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class Service extends Entity<ServiceProps> {
  get title() {
    return this.props.title;
  }
  get titleEn() {
    return this.props.titleEn;
  }
  get parentId() {
    return this.props.parentId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<ServiceProps, "createdAt">, id?: UniqueEntityID) {
    const service = new Service({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return service;
  }
}
