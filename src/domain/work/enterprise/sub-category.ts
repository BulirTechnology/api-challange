import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface SubCategoryProps {
  title: string
  titleEn: string
  url: string
  hasSubSubCategory: boolean
  categoryId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class SubCategory extends Entity<SubCategoryProps> {
  get title() {
    return this.props.title;
  }
  get titleEn() {
    return this.props.titleEn;
  }
  get hasSubSubCategory() {
    return this.props.hasSubSubCategory;
  }
  get url() {
    return this.props.url;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<SubCategoryProps, "createdAt">, id?: UniqueEntityID) {
    const category = new SubCategory({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return category;
  }
}
