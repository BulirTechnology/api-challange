import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type BookingState = "PENDING" | "ACTIVE" | "COMPLETED" | "EXPIRED" | "DISPUTE"
export type BookingWorkState = "UPCOMING" | "RUNNING"
export type BookingRequestWorkState = "UPCOMING" | "REQUEST_START" | "REQUEST_START_DENIED" | "RUNNING" | "REQUEST_FINISH" | "REQUEST_FINISH_DENIED" | "COMPLETED" | "DISPUTE"

export interface BookingProps {
  image1: string
  image2: string | null
  image3: string | null
  image4: string | null
  image5: string | null
  image6: string | null
  title: string
  jobId: UniqueEntityID
  finalPrice: number
  workState: BookingWorkState
  state: BookingState
  requestWorkState: BookingRequestWorkState
  category?: string
  categoryId?: UniqueEntityID
  subCategory?: string
  subCategoryId?: UniqueEntityID
  subSubCategory?: string
  subSubCategoryId?: UniqueEntityID
  service?: string
  serviceId: UniqueEntityID
  workDate: Date
  serviceProviderId: UniqueEntityID
  clientId: UniqueEntityID
  description: string
  totalTryingToStart: number
  totalTryingToFinish: number
  clientReview: number | null
  serviceProviderReview: number | null
  address?: {
    id: UniqueEntityID
    latitude: number
    longitude: number
    line1: string
    line2: string
  }
  client?: {
    id: UniqueEntityID
    name: string
    profileUrl: string
    rating: number
  }
  serviceProvider?: {
    id: UniqueEntityID
    name: string
    profileUrl: string
    rating: number
    isFavorite: boolean
  }
  answers?: {
    question: string,
    answer: string[],
    answerId: string[]
    questionId: string
  }[]
  conversationId: string
  clientSendReview: boolean
  serviceProviderSendReview: boolean
  hasStartedDispute: boolean
  completedAt?: Date | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Booking extends Entity<BookingProps> {
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get hasStartedDispute() {
    return this.props.hasStartedDispute;
  }
  get clientSendReview() {
    return this.props.clientSendReview;
  }
  get serviceProviderSendReview() {
    return this.props.serviceProviderSendReview;
  }
  get clientReview() {
    return this.props.clientReview;
  }
  get serviceProviderReview() {
    return this.props.serviceProviderReview;
  }
  get state() {
    return this.props.state;
  }
  get conversationId() {
    return this.props.conversationId;
  }
  get totalTryingToStart() {
    return this.props.totalTryingToStart;
  }
  get totalTryingToFinish() {
    return this.props.totalTryingToFinish;
  }
  get jobId() {
    return this.props.jobId;
  }
  get requestWorkState() {
    return this.props.requestWorkState;
  }
  get answers() {
    return this.props.answers;
  }
  get workDate() {
    return this.props.workDate;
  }
  get workState() {
    return this.props.workState;
  }
  get finalPrice() {
    return this.props.finalPrice;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get serviceProvider() {
    return this.props.serviceProvider;
  }
  get clientId() {
    return this.props.clientId;
  }
  get client() {
    return this.props.client;
  }
  get serviceId() {
    return this.props.serviceId;
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
  get completedAt() {
    return this.props.completedAt;
  }

  static create(props: Optional<BookingProps, "createdAt">, id?: UniqueEntityID) {
    const booking = new Booking({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return booking;
  }
}
