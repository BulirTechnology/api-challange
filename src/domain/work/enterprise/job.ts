import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { ViewState } from "./task";
import { QuotationStatus } from "./quotation";

export type JobState =   "OPEN" | "CLOSED" | "BOOKED"

export type QuotationState = "OPEN_TO_QUOTE" | "QUOTED"

export interface JobProps {
  title: string
  description: string
  price: number
  startDate: Date
  addressId: UniqueEntityID
  clientId: UniqueEntityID
  image1: string
  image2: string | null
  image3: string | null
  image4: string | null
  image5: string | null
  image6: string | null
  state: JobState
  viewState: ViewState
  quotationState: QuotationState
  createdAt: Date
  updatedAt?: Date | null
  category?: string
  categoryId?: UniqueEntityID
  subCategory?: string
  subCategoryId?: UniqueEntityID
  subSubCategory?: string
  subSubCategoryId?: UniqueEntityID
  service?: string
  serviceId: UniqueEntityID
  cancelDescription?: string
  cancelReasonId?: UniqueEntityID
  address?: {
    name: string
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
  quotations?: {
    id: string
    serviceProviderName: string
    serviceProviderId: string
    profileUrl: string
    rating: number
    budget: number
    readByClient: boolean
    status: QuotationStatus
    date: Date
    createdAt: Date
    description: string
    serviceProviderIsFavorite: boolean
  }[]
}

export class Job extends Entity<JobProps> {
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get viewState() {
    return this.props.viewState;
  }
  get answers() {
    return this.props.answers;
  }
  get quotations() {
    return this.props.quotations;
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
  get serviceId() {
    return this.props.serviceId;
  }
  get quotationState() {
    return this.props.quotationState;
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
  get address() {
    return this.props.address;
  }
  get startDate() {
    return this.props.startDate;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
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
  get subSubCategory() {
    return this.props.subSubCategory;
  }
  get subSubCategoryId() {
    return this.props.subSubCategoryId;
  }
  get service() {
    return this.props.service;
  }
  get cancelDescription() {
    return this.props.cancelDescription;
  }
  get cancelReasonId() {
    return this.props.cancelReasonId;
  }

  static create(props: Optional<JobProps, "createdAt">, id?: UniqueEntityID) {
    const category = new Job({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return category;
  }
}
