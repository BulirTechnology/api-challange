import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type DocumentType = "NIF" | "BI_FRONT" | "BI_BACK"

export interface DocumentProps {
  title: string
  url: string
  type: DocumentType
  serviceProviderId: UniqueEntityID
  createdAt: Date
}

export class Document extends Entity<DocumentProps> {
  get title() {
    return this.props.title;
  }
  get url() {
    return this.props.url;
  }
  get type() {
    return this.props.type;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<DocumentProps, "createdAt">, id?: UniqueEntityID) {

    const otp = new Document({
      title: props.title,
      type: props.type,
      url: props.url,
      serviceProviderId: props.serviceProviderId,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return otp;
  }
}
