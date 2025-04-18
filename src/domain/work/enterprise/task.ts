import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type ViewState = "PUBLIC" | "PRIVATE"

export type TaskState = "ACTIVE" | "DRAFT" | "INACTIVE" | "PUBLISHED" | "CLOSED"
export type DraftStep =
  "SelectBaseInfo" |
  "SelectServiceProviders" |
  "SelectAddress" |
  "SelectAnswers" |
  "SelectImages" |
  "SelectCategory" |
  "SelectSubCategory" |
  "SelectSubSubCategory" |
  "SelectService" |
  "SelectStartDate"

export interface TaskProps {
  title: string
  description: string
  viewState: ViewState
  serviceId: UniqueEntityID | null
  addressId: UniqueEntityID | null
  image1: string | null
  image2: string | null
  image3: string | null
  image4: string | null
  image5: string | null
  image6: string | null
  clientId: UniqueEntityID
  category?: string
  categoryId?: UniqueEntityID
  subCategory?: string
  subCategoryId?: UniqueEntityID
  subSubCategory?: string
  subSubCategoryId?: UniqueEntityID
  subSubSubCategoryId?: UniqueEntityID
  service?: string
  serviceProviderIds: string[]
  serviceProviders: {
    id: string,
    firstName: string
    lastName: string
    rating: number
    userId: string
    isFavorite: boolean
    profileImage: string
  }[]
  address?: {
    id: string
    name: string
    isPrimary: boolean
    latitude: number
    longitude: number
    line1: string
    line2: string
  }
  answers?: {
    question: string,
    answer: string[],
    answerId: string[]
    questionId: string
  }[]
  state: TaskState
  price: number
  draftStep: DraftStep
  startDate: Date | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Task extends Entity<TaskProps> {
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get viewState() {
    return this.props.viewState;
  }
  get price() {
    return this.props.price;
  }
  get clientId() {
    return this.props.clientId;
  }
  get addressId() {
    return this.props.addressId;
  }
  get address() {
    return this.props.address;
  }
  get serviceId() {
    return this.props.serviceId;
  }
  get answers() {
    return this.props.answers;
  }
  get state() {
    return this.props.state;
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
  get startDate() {
    return this.props.startDate;
  }
  get category() {
    return this.props.category;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get subCategory() {
    return this.props.subCategory;
  }
  get subCategoryId() {
    return this.props.subCategoryId;
  }
  get subSubSubCategoryId() {
    return this.props.subSubSubCategoryId;
  }
  get subSubCategory() {
    return this.props.subSubCategory;
  }
  get subSubCategoryId() {
    return this.props.subSubCategoryId;
  }
  get service() {
    return this.props.service;
  }
  get serviceProviders() {
    return this.props.serviceProviders;
  }
  get serviceProviderIds() {
    return this.props.serviceProviderIds;
  }
  get draftStep() {
    return this.props.draftStep;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<TaskProps, "createdAt">, id?: UniqueEntityID) {
    const category = new Task({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return category;
  }
}
