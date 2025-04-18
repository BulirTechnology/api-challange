import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface SubSubCategoryProps {
  title: string
  titleEn: string
  url: string
  subCategoryId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class SubSubCategory extends Entity<SubSubCategoryProps> {
  get title() {
    return this.props.title;
  }
  get titleEn() {
    return this.props.titleEn;
  }
  get url() {
    return this.props.url;
  }
  get subCategoryId() {
    return this.props.subCategoryId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<SubSubCategoryProps, "createdAt">, id?: UniqueEntityID) {
    const category = new SubSubCategory({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return category;
  }
}
