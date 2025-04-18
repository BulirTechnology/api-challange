import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type Rate = "FIXED" | "HOURLY"

export interface SpecializationProps {
  title: string,
  price: number,
  rate: Rate,
  serviceId: UniqueEntityID,
  service?: string
  subSubCategoryId?: UniqueEntityID,
  subSubCategory?: string,
  subCategoryId?: UniqueEntityID,
  subCategory?: string
  categoryId?: UniqueEntityID,
  category?: string
  categoryUrl?: string
  serviceProviderId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class Specialization extends Entity<SpecializationProps> {
  get title() {
    return this.props.title;
  }
  get subCategory() {
    return this.props.subCategory;
  }
  get subCategoryId() {
    return this.props.subCategoryId;
  }
  get service() {
    return this.props.service;
  }
  get subSubCategoryId() {
    return this.props.subSubCategoryId;
  }
  get subSubCategory() {
    return this.props.subSubCategory;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get category() {
    return this.props.category;
  }
  get price() {
    return this.props.price;
  }
  get rate() {
    return this.props.rate;
  }
  get serviceId() {
    return this.props.serviceId;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get categoryUrl() {
    return this.props.categoryUrl;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<SpecializationProps, "createdAt">, id?: UniqueEntityID) {
    const otp = new Specialization({
      serviceProviderId: props.serviceProviderId,
      price: props.price,
      rate: props.rate,
      serviceId: props.serviceId,
      title: props.title,
      category: props.category ?? "",
      categoryId: props.categoryId ?? new UniqueEntityID(""),
      subCategory: props.subCategory ?? "",
      subCategoryId: props.subCategoryId ?? new UniqueEntityID(""),
      subSubCategory: props.subSubCategory ?? "",
      subSubCategoryId: props.subSubCategoryId ?? new UniqueEntityID(""),
      createdAt: props.createdAt ?? new Date(),
      categoryUrl: props.categoryUrl
    }, id);

    return otp;
  }
}
