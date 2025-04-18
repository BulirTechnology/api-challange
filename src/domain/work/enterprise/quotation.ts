import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export type QuotationStatus = "PENDING" | "ACCEPTED" | "REJECTED"

export interface QuotationProps {
  budget: number
  cover: string
  jobId: UniqueEntityID
  readByClient: boolean
  id?: UniqueEntityID
  serviceProviderId?: UniqueEntityID
  serviceProviderName?: string
  serviceProviderProfileUrl?: string
  serviceProviderRating?: number
  isServiceProviderFavoriteOfClient?: boolean
  clientId?: string
  clientName?: string
  clientProfileUrl?: string
  clientRating?: number
  state: QuotationStatus
  date: Date
  rejectDescription?: string | null
  rejectReasonId?: string | null
  createdAt: Date
  updatedAt?: Date | null
}
type OptionalFields = 
  "createdAt"
  | "serviceProviderName"
  | "serviceProviderProfileUrl"
  | "serviceProviderRating"
  | "isServiceProviderFavoriteOfClient"
  | "clientId"
  | "clientName"
  | "clientProfileUrl"
  | "clientRating";

// Criar um novo tipo que faz com que os campos listados sejam opcionais
type QuotationPropsWithOptionalFields = Omit<QuotationProps, OptionalFields> & Partial<Pick<QuotationProps, OptionalFields>>;

export class Quotation extends Entity<QuotationProps> {
  get budget() {
    return this.props.budget;
  }
  get serviceProviderName() {
    return this.props.serviceProviderName;
  }
  get serviceProviderProfileUrl() {
    return this.props.serviceProviderProfileUrl;
  }
  get serviceProviderRating() {
    return this.props.serviceProviderRating;
  }
  get isServiceProviderFavoriteOfClient() {
    return this.props.isServiceProviderFavoriteOfClient;
  }
  get clientId() {
    return this.props.clientId;
  }
  get clientName() {
    return this.props.clientName;
  }
  get clientProfileUrl() {
    return this.props.clientProfileUrl;
  }
  get clientRating() {
    return this.props.clientRating;
  }
  get cover() {
    return this.props.cover;
  }
  get readByClient() {
    return this.props.readByClient;
  }
  get jobId() {
    return this.props.jobId;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get state() {
    return this.props.state;
  }
  get date() {
    return this.props.date;
  }
  get rejectDescription() {
    return this.props.rejectDescription;
  }
  get rejectReasonId() {
    return this.props.rejectReasonId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: QuotationPropsWithOptionalFields) {
    const quotation = new Quotation({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, props.id);

    return quotation;
  }
}
