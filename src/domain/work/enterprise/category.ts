import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface CategoryProps {
  title: string
  titleEn: string
  url: string
  priority: number
  createdAt: Date
  updatedAt?: Date | null
}

export class Category extends Entity<CategoryProps> {
  get title() {
    return this.props.title;
  }
  get titleEn() {
    return this.props.titleEn;
  }
  get url() {
    return this.props.url;
  }
  get priority() {
    return this.props.priority;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<CategoryProps, "createdAt">, id?: UniqueEntityID) {
    const category = new Category({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return category;
  }
}
